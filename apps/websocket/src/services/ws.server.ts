import {
  APP_CONFIG,
  BurstPingCommand,
  BurstPingResultMessage,
  type ChatMessage,
  HealthStatus,
  JsonHelper,
  LoggerBaseService,
  LoggerLogLevel,
  MeCommand,
  MeMessage,
  type MetricsMessage,
  type MouseCommand,
  type PointerMessage,
  type PongMessage,
  type TouchCommand,
  UpdateMeCommand,
  UpdateMessage,
  UpdateStatus,
  type WsClientFlags,
  WsClientInterface,
  type WsClientPointerInterface,
  WsCommands,
  type WsHttpRequestCommand,
  type WsHttpResponseMessage,
  WsMessages,
  WsMessageTypes,
} from '@o2k/core';
import compression from 'compression';
import { randomUUID } from 'crypto';
import cors, { CorsOptions } from 'cors';
import type { Express, Request, Response } from 'express';
import express from 'express';
import { IncomingMessage } from 'http';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import * as os from 'node:os';
import process from 'node:process';
import { RawData, VerifyClientCallbackAsync, WebSocket, WebSocketServer } from 'ws';
import { perMessageDeflate } from '../config';
import { WsOptions } from '../interfaces';
import { monitorEventLoopDelay } from 'perf_hooks';
import { ContentRepository } from '@o2k/core/core/repositories/content.repository';
import { LikesRepository } from '@o2k/core/core/repositories/likes.repository';

const histogram = monitorEventLoopDelay({ resolution: 10 }); // 10ms buckets
histogram.enable();

type WsCookieSameSite = 'strict' | 'lax' | 'none';

interface WsClientCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  hostOnly: boolean;
  secure: boolean;
  sameSite: WsCookieSameSite;
  expiresAt?: number;
}

export class WsServer {
  private readonly uuid = randomUUID();
  private readonly _pingInterval: NodeJS.Timeout;
  private readonly _healthInterval: NodeJS.Timeout;
  private readonly _heartbeatInterval: NodeJS.Timeout;
  private readonly _pointerInterval: NodeJS.Timeout;

  private clientCounter = 0;
  private server!: https.Server | http.Server;
  private readonly wss: WebSocketServer;
  private readonly options: WsOptions;

  private readonly clientMap = new Map<WebSocket, WsClientInterface>();
  private readonly logger: LoggerBaseService;
  private readonly _isSSL: boolean = false;
  private readonly app: Express;
  private readonly content: ContentRepository;
  private readonly likes: LikesRepository;
  private readonly clientCookies = new Map<string, WsClientCookie[]>();

  constructor(options: WsOptions, content: ContentRepository, likes: LikesRepository) {
    this.options = options;
    this.content = content;
    this.likes = likes;
    this._isSSL = options?.ssl === true && options.port !== 80;

    this.logger = new LoggerBaseService();
    this.logger.logLevel = options?.logger ?? LoggerLogLevel.LOG;

    this.app = express();
    this.addDefaults(options.origin);
    this.addHealthCheck();
    this.addContentApi();
    this.createServer(options.host, options.port);

    this.wss = new WebSocketServer({
      server: this.server,
      perMessageDeflate,
      verifyClient: this.verifyClient.bind(this),
    });

    /**
     *   COMPOSE_WSS_PING: '60_000'
     *   COMPOSE_WSS_HEARTBEAT: '120_000'
     *   COMPOSE_WSS_HEALTH: '600_000'
     */
    this._heartbeatInterval = setInterval(
      () => this.heartbeat(),
      APP_CONFIG.wsServer.heartbeat ?? 120_000
    );
    this._pingInterval = setInterval(() => this.ping(), APP_CONFIG.wsServer.ping ?? 60_000);
    this._healthInterval = setInterval(() => this.health(), APP_CONFIG.wsServer.health ?? 600_000);
    this._pointerInterval = setInterval(
      () => this.pushPointersData(),
      1000 / (APP_CONFIG.wsServer.fps ?? 15)
    );
  }

  get isSSL(): boolean {
    return this._isSSL;
  }

  private getUserIdFromRequest(req: Request): string | null {
    const header = req.header('cookie');
    if (!header) {
      return null;
    }
    const parts = header.split(';');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('o2k_uid=')) {
        return decodeURIComponent(trimmed.substring('o2k_uid='.length));
      }
    }
    return null;
  }

  private setUserIdCookie(res: Response, id: string): void {
    const attrs = [
      `o2k_uid=${encodeURIComponent(id)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=31536000',
    ];
    if (this._isSSL) {
      attrs.push('Secure');
    }
    res.setHeader('Set-Cookie', attrs.join('; '));
  }

  private addContentApi() {
    const handleContentRoute = (route: string, res: Response) => {
      if (!route) {
        res.status(400).type('json').send({ error: 'route_required' });
        return;
      }

      try {
        const page = this.content.getPageByRoute(route);
        if (!page || !page.isPublished) {
          res.status(404).type('json').send({ error: 'not_found' });
          return;
        }
        res.status(200).type('json').send(page);
      } catch (err) {
        this.logger.error('WsServer', 'content.page', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    };

    this.app.get('/content', (_req, res) => {
      handleContentRoute('/content', res);
    });

    this.app.get('/content/:slug', (req, res) => {
      const slug = decodeURIComponent(req.params.slug);
      const route = `/content/${slug}`;
      handleContentRoute(route, res);
    });

    this.app.get('/content/:topic/:slug', (req, res) => {
      const topic = decodeURIComponent(req.params.topic);
      const slug = decodeURIComponent(req.params.slug);
      const route = `/content/${topic}/${slug}`;
      handleContentRoute(route, res);
    });

    this.app.get('/tree', (_req, res) => {
      try {
        const items = this.content.tree('created_at');
        res.status(200).type('json').send(items);
      } catch (err) {
        this.logger.error('WsServer', 'content.tree', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    });

    this.app.get('/navigation/:location', (req, res) => {
      const location = decodeURIComponent(req.params.location || '');
      if (!location) {
        res.status(400).type('json').send({ error: 'location_required' });
        return;
      }

      try {
        const items = this.content.getNavigation(location);
        res.status(200).type('json').send(items);
      } catch (err) {
        this.logger.error('WsServer', 'content.navigation', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    });

    this.app.get('/sitemap-routes', (_req, res) => {
      try {
        const routes = this.content.getSitemapRoutes();
        res.status(200).type('json').send({ routes });
      } catch (err) {
        this.logger.error('WsServer', 'content.sitemapRoutes', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    });

    this.app.get('/cards', (_, res) => {
      try {
        const items = this.content.getAllCards();
        res.status(200).type('json').send(items);
      } catch (err) {
        this.logger.error('WsServer', 'content.cards', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    });

    this.app.get('/cards/:topic', (req, res) => {
      const topic = decodeURIComponent(req.params.topic || '');
      if (!topic) {
        res.status(400).type('json').send({ error: 'topic_required' });
        return;
      }

      try {
        const items = this.content.getCards(topic);
        res.status(200).type('json').send(items);
      } catch (err) {
        this.logger.error('WsServer', 'content.cards', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    });

    this.app.get('/likes/:articleId', (req, res) => {
      const articleId = parseInt(decodeURIComponent(req.params.articleId), 10);
      const userId = this.getUserIdFromRequest(req) ?? null;
      const state = this.likes.getState(articleId, userId);
      res.json(state);
    });

    this.app.post('/likes/:articleId/toggle', (req, res) => {
      const articleId = parseInt(decodeURIComponent(req.params.articleId));
      let userId = this.getUserIdFromRequest(req);
      if (!userId) {
        userId = randomUUID();
        this.setUserIdCookie(res, userId);
      }
      const state = this.likes.toggle(articleId, userId);
      res.json(state);
    });

    this.app.get('/likes', (req, res) => {
      const userId = this.getUserIdFromRequest(req) ?? null;
      const state = this.likes.getAllStates(userId);
      res.json(state);
    });

    this.app.get('/random-cards/:amount', (req, res) => {
      const amount = parseInt(decodeURIComponent(req.params.amount || '1'), 10);
      if (!amount) {
        res.status(400).type('json').send({ error: 'amount_required' });
        return;
      }

      try {
        const items = this.content.getRandomCards(amount);
        res.status(200).type('json').send(items);
      } catch (err) {
        this.logger.error('WsServer', 'content.cards', err);
        res.status(500).type('json').send({ error: 'internal_error' });
      }
    });

    this.app.get('/privacy', (req, res) => {
      const cookies = req.header('cookie')?.split(';') ?? [];
      res.json({
        cookies:
          cookies.map((cookie: string) => {
            const [key, value] = cookie.split('=');
            return {
              key,
              value,
            };
          }) ?? [],
      });
    });
  }

  listen() {
    this.wss.on('connection', (socket, request) => {
      this.addClient(socket, request);
      socket.on('message', data => this.handleMessage(socket, data));
      socket.on('close', (_code: number) => this.removeClient(socket));
    });
  }

  private addDefaults(origin: string) {
    const options: CorsOptions = {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      origin: origin,
      maxAge: 24 * 3600,
      exposedHeaders: ['Content-Encoding'],
      allowedHeaders: [
        'Origin',
        'Range',
        'Accept',
        'User-Agent',
        'Content-Type',
        'Authorization',
        'cache-control',
        'pragma',
        'Accept-Language',
        'Sec-Fetch-Mode',
        'Sec-Fetch-Site',
        'Sec-Fetch-Dest',
        'If-None-Match',
      ],
    };
    this.app.use(
      compression({
        level: 8,
        threshold: 0,
        filter: (req, res) =>
          req.headers['x-no-compression'] ? false : compression.filter(req, res),
      })
    );
    this.app.use(cors(options));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      const started = Date.now();
      res.on('finish', () => {
        this.logger.info(
          'WsServer.access',
          `${req.method.toUpperCase()} ${req.originalUrl || req.url} -> ${res.statusCode} ${Date.now() - started}ms`
        );
      });
      next();
    });
    this.app.disable('x-powered-by');
    this.app.get('/', (_, res) => {
      res.status(301).redirect(APP_CONFIG.url);
    });
  }

  private addHealthCheck() {
    this.app.get('/_health', (_, res) => {
      res.status(200).type('json').send(this.getHealthData());
    });
  }

  private getHealthData(): HealthStatus {
    const loadAvg = os.loadavg();
    const eventLoopDelayMs = histogram.mean / 1.0e6;
    return {
      uptime: process.uptime(),
      memory: process.availableMemory(),
      usage: process.memoryUsage(),
      os: {
        cpus: os.cpus().length,
        totalmem: os.totalmem(),
        freemem: os.freemem(),
      },
      eventLoopDelayMs,
      loadAvg,
      message: 'OK',
      version: this.options.version,
      hash: this.options.hash,
      clients: this.clientMap.size,
    };
  }

  private createServer(host: string, port: number) {
    if (this.isSSL) {
      this.logger.info('WsServer.createServer: create https server');
      const key = fs.readFileSync('ssl/sslKey.pem');
      const cert = fs.readFileSync('ssl/sslCert.pem');
      this.server = https.createServer({ cert, key }, this.app).listen(port, () => {
        const suffix = port !== 443 ? `:${port}` : '';
        this.logger.info(`WsServer`, ` ➜  https://${host}${suffix}`);
        this.logger.info(`WsServer`, ` ➜  wss://${host}${suffix}`);
      });
    } else {
      this.logger.info('WsServer.createServer: create http server');
      this.server = http.createServer(this.app).listen(port, () => {
        const suffix = port !== 80 ? `:${port}` : '';
        this.logger.info(`WsServer`, ` ➜  http://${host}${suffix}`);
        this.logger.info(`WsServer`, ` ➜  ws://${host}${suffix}`);
      });
    }
  }

  private seqNumber(): number {
    return ++this.clientCounter;
  }

  private timestamp(): number {
    return new Date().getTime();
  }

  private verifyClient: VerifyClientCallbackAsync = (info, cb) => {
    const { origin, secure } = info;
    this.logger.debug('WsServer', 'verifyClient', { origin, secure });
    // @todo: implement validation
    cb(true);
  };

  private handleMessage(socket: WebSocket, data: RawData): void {
    try {
      const message = JSON.parse(`${data ?? 'null'}`);
      const client = this.clientMap.get(socket);
      if (client && message) {
        if (message.command) {
          this.handleMessageCommands(client, message);
        }
        if (message.event) {
          this.handleMessageEvents(client, message);
        }
      } else {
        if (!client) {
          this.logger.error(`WsServer.handleMessage client missing`);
        }
        if (!message) {
          this.logger.error(`WsServer.handleMessage message missing`);
        }
      }
    } catch (e) {
      this.logger.error(`WsServer.handleMessage`, e);
    }
  }

  private reply<T = WsMessageTypes>(
    message: Omit<T, 'uuid' | 'created'>,
    client: WsClientInterface
  ) {
    this._clientSocketSend(message, client);
  }

  private _clientSocketSend<T = WsMessageTypes>(
    message: Omit<T, 'uuid' | 'created'>,
    client: WsClientInterface
  ) {
    try {
      const created = this.timestamp();
      const uuid = randomUUID();
      const data = JsonHelper.stringify({ ...message, created, uuid });
      client.socket.send(data);
    } catch (e) {
      this.logger.error(`WsServer.sendMessageToClient`, { message, e });
    }
  }

  private broadcast(message: Partial<WsMessageTypes>) {
    if (!message.author) {
      message.author = {
        uuid: this.uuid,
        name: 'System',
      };
    }
    this.clientMap.forEach(client => this._clientSocketSend(message, client));
  }

  private addClient(socket: WebSocket, _request: IncomingMessage) {
    const seq = this.seqNumber();
    const uuid = randomUUID();
    const user = { uuid };
    const created = this.timestamp();
    const flags: WsClientFlags = {
      hasPointer: false,
    };

    const requestHeaders = this.extractRequestHeaders(_request);
    this.clientMap.set(socket, {
      seq,
      created,
      uuid,
      socket,
      flags,
      user,
      requestHeaders,
    });
    this.clientCookies.set(
      uuid,
      this.parseCookieHeader(requestHeaders['cookie'], this.extractHostname(requestHeaders['host']))
    );
    this.pushClientsCount();
  }

  private extractRequestHeaders(request: IncomingMessage): Record<string, string> {
    const headers: Record<string, string> = {};
    Object.entries(request.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key.toLowerCase()] = value;
      } else if (Array.isArray(value)) {
        headers[key.toLowerCase()] = value.join(', ');
      }
    });
    return headers;
  }

  private removeClient(socket: WebSocket) {
    const client = this.clientMap.get(socket);
    if (client) {
      this.clientCookies.delete(client.uuid);
    }
    this.clientMap.delete(socket);
    this.pushClientsCount();
  }

  private ping() {
    this.broadcast({ command: 'ping' });
  }

  private health() {
    this.broadcast({
      event: 'health',
      message: randomUUID(),
      health: this.getHealthData(),
    });
  }

  private heartbeat() {
    this.broadcast({
      event: 'heartbeat',
      message: randomUUID(),
      health: this.getHealthData(),
    });
  }

  private handleMessageCommands(client: WsClientInterface, message: WsCommands) {
    const reply: Pick<WsMessages, 'author' | 'message'> = {
      author: client.user,
      message: message.message,
    };
    switch (message?.command) {
      case 'chat':
        this.broadcast({ ...reply, event: 'chat' });
        break;
      case 'ping':
        this.reply(<PongMessage>{ ...reply, event: 'pong' }, client);
        break;
      case 'version':
        this.sendUpdateData(client.socket, message.current);
        break;
      case 'me':
      case 'updateMe':
        this.handleMe(client.socket, message);
        break;
      case 'mouse':
        this.handleMouseEvent(message, client);
        break;
      case 'touch':
        this.handleTouchEvent(message, client);
        break;
      case 'pointer-start':
        client.flags.hasPointer = true;
        break;
      case 'pointer-stop':
        client.flags.hasPointer = false;
        this.reply(
          <PointerMessage>{
            message: 'PointersData',
            event: 'pointer',
            pointers: [] as WsClientPointerInterface[],
          },
          client
        );
        break;
      case 'burst-ping-pong':
        if (!message.started && !message.start) {
          message.started = new Date().getTime();
          message.start = message.countdown;
          message.countdown += 1;
        }
        this.handleBurstPingPong({ ...message, author: reply.author }, client);
        break;
      case 'metrics':
        this.reply(
          <MetricsMessage>{
            ...reply,
            event: 'metrics',
            message: 'List of clients connected',
            clients: [
              ...Array.from(this.clientMap.values()).map(
                client =>
                  <WsClientInterface>{
                    uuid: client.uuid,
                    created: client.created,
                    seq: client.seq,
                    rtt: client.rtt,
                    user: client.user,
                  }
              ),
            ],
          },
          client
        );
        break;
      case 'http-request':
        void this.handleHttpRequest(client, message);
        break;
    }
  }

  private async handleHttpRequest(client: WsClientInterface, message: WsHttpRequestCommand) {
    const request = message.request;
    const requestId = request?.requestId;
    const target = this.resolveLocalApiUrl(request?.url);
    const method = this.resolveHttpMethod(request);

    if (!requestId || !target || !method) {
      this.reply(
        <WsHttpResponseMessage>{
          event: 'http-response',
          requestId: requestId ?? 'missing',
          ok: false,
          status: 400,
          url: request?.url ?? '',
          error: !method ? 'invalid_method' : 'invalid_request',
        },
        client
      );
      return;
    }

    try {
      const upstreamHeaders = this.resolveUpstreamHeaders(
        request.headers,
        client,
        request.withCredentials,
        request.url,
        method,
        request.body
      );
      const response = await fetch(target, {
        method,
        headers: upstreamHeaders,
        body:
          request.body && !['GET', 'HEAD'].includes(method)
            ? JSON.stringify(request.body)
            : undefined,
      });

      const contentType = response.headers.get('content-type') ?? '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => (responseHeaders[key] = value));
      this.captureSetCookieHeaders(client, response.headers, request.url);

      this.reply(
        <WsHttpResponseMessage>{
          event: 'http-response',
          requestId,
          ok: response.ok,
          status: response.status,
          url: request.url,
          headers: responseHeaders,
          body,
        },
        client
      );
    } catch (error) {
      this.reply(
        <WsHttpResponseMessage>{
          event: 'http-response',
          requestId,
          ok: false,
          status: 500,
          url: request.url,
          error: error instanceof Error ? error.message : 'unknown_error',
        },
        client
      );
    }
  }

  private resolveUpstreamHeaders(
    requestHeaders: Record<string, string> | undefined,
    client: WsClientInterface,
    withCredentials?: boolean,
    url?: string,
    method?: string,
    body?: unknown
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    Object.entries(requestHeaders ?? {}).forEach(([key, value]) => {
      headers[key.toLowerCase()] = value;
    });

    const hasBody = typeof body !== 'undefined' && body !== null;
    const normalizedMethod = (method ?? 'GET').toUpperCase();
    if (
      hasBody &&
      !['GET', 'HEAD'].includes(normalizedMethod) &&
      headers['content-type'] === undefined
    ) {
      headers['content-type'] = 'application/json';
    }

    if (withCredentials && !headers['cookie']) {
      const cookie = this.getClientCookieHeader(client, url);
      if (cookie) {
        headers['cookie'] = cookie;
      }
    }

    if (!headers['authorization']) {
      const authorization = client.requestHeaders?.['authorization'];
      if (authorization) {
        headers['authorization'] = authorization;
      }
    }

    return headers;
  }

  private parseCookieHeader(cookieHeader?: string, requestHost?: string): WsClientCookie[] {
    const cookies: WsClientCookie[] = [];
    if (!cookieHeader) {
      return cookies;
    }

    const host = requestHost?.toLowerCase();
    if (!host) {
      return cookies;
    }

    cookieHeader.split(';').forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) {
        return;
      }
      const separator = trimmed.indexOf('=');
      if (separator <= 0) {
        return;
      }
      const name = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!name) {
        return;
      }

      this.upsertClientCookie(cookies, {
        name,
        value,
        domain: host,
        path: '/',
        hostOnly: true,
        secure: false,
        sameSite: 'lax',
      });
    });

    return cookies;
  }

  private getClientCookieHeader(client: WsClientInterface, url?: string): string | undefined {
    const cookieJar = this.clientCookies.get(client.uuid);
    if (!cookieJar || !cookieJar.length || !url) {
      return undefined;
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url, APP_CONFIG.api);
    } catch {
      return undefined;
    }

    const now = Date.now();
    const filteredJar = cookieJar.filter(cookie => !this.isCookieExpired(cookie, now));
    this.clientCookies.set(client.uuid, filteredJar);

    const requestHost = targetUrl.hostname.toLowerCase();
    const requestPath = targetUrl.pathname || '/';
    const isHttpsRequest = targetUrl.protocol === 'https:';
    const requestSite = this.getSiteKey(targetUrl.hostname);
    const originSite = this.getSiteKey(this.extractHostname(client.requestHeaders?.['origin']));
    const requestProtocol = targetUrl.protocol.replace(':', '');
    const originProtocol = this.extractOriginProtocol(client.requestHeaders?.['origin']);
    const isSameSite = !originSite
      ? true
      : !!requestSite &&
        requestSite === originSite &&
        !!requestProtocol &&
        !!originProtocol &&
        requestProtocol === originProtocol;

    const selectedCookies = filteredJar
      .filter(cookie => {
        if (cookie.secure && !isHttpsRequest) {
          return false;
        }

        if (cookie.hostOnly) {
          if (cookie.domain !== requestHost) {
            return false;
          }
        } else if (requestHost !== cookie.domain && !requestHost.endsWith(`.${cookie.domain}`)) {
          return false;
        }

        if (!this.pathMatches(requestPath, cookie.path)) {
          return false;
        }

        if ((cookie.sameSite === 'strict' || cookie.sameSite === 'lax') && !isSameSite) {
          return false;
        }

        if (cookie.sameSite === 'none' && !cookie.secure) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.path.length - a.path.length);

    if (!selectedCookies.length) {
      return undefined;
    }

    return selectedCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  }

  private captureSetCookieHeaders(
    client: WsClientInterface,
    headers: Headers,
    requestUrl?: string
  ): void {
    const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const setCookieHeaders =
      typeof getSetCookie === 'function' ? getSetCookie.call(headers) : ([] as string[]);
    if (!setCookieHeaders.length) {
      const fallbackSetCookie = headers.get('set-cookie');
      if (fallbackSetCookie) {
        setCookieHeaders.push(fallbackSetCookie);
      }
    }

    if (!setCookieHeaders.length) {
      return;
    }

    if (!requestUrl) {
      return;
    }

    const cookieJar = this.clientCookies.get(client.uuid) ?? [];
    setCookieHeaders.forEach(cookieLine => {
      const parsed = this.parseSetCookieHeader(cookieLine, requestUrl);
      if (!parsed) {
        return;
      }
      if (parsed.expiresAt !== undefined && parsed.expiresAt <= Date.now()) {
        this.removeClientCookie(cookieJar, parsed.name, parsed.domain, parsed.path);
        return;
      }
      this.upsertClientCookie(cookieJar, parsed);
    });
    this.clientCookies.set(client.uuid, cookieJar);
  }

  private parseSetCookieHeader(cookieLine: string, requestUrl: string): WsClientCookie | null {
    let url: URL;
    try {
      url = new URL(requestUrl, APP_CONFIG.api);
    } catch {
      return null;
    }

    const parts = cookieLine
      .split(';')
      .map(part => part.trim())
      .filter(Boolean);
    if (!parts.length) {
      return null;
    }

    const [cookiePart, ...attributes] = parts;
    if (!cookiePart) {
      return null;
    }
    const separator = cookiePart.indexOf('=');
    if (separator <= 0) {
      return null;
    }

    const name = cookiePart.slice(0, separator).trim();
    const value = cookiePart.slice(separator + 1).trim();
    if (!name) {
      return null;
    }

    const requestHost = url.hostname.toLowerCase();
    let domain = requestHost;
    let hostOnly = true;
    let path = this.defaultCookiePath(url.pathname);
    let secure = false;
    let sameSite: WsCookieSameSite = 'lax';
    let expiresAt: number | undefined;

    for (const attribute of attributes) {
      const [rawKey, ...rawValueParts] = attribute.split('=');
      const key = rawKey?.trim().toLowerCase();
      const valuePart = rawValueParts.join('=').trim();

      switch (key) {
        case 'domain': {
          if (!valuePart) {
            break;
          }
          const normalized = valuePart.replace(/^\./, '').toLowerCase();
          if (requestHost === normalized || requestHost.endsWith(`.${normalized}`)) {
            domain = normalized;
            hostOnly = false;
          }
          break;
        }
        case 'path':
          if (valuePart && valuePart.startsWith('/')) {
            path = valuePart;
          }
          break;
        case 'secure':
          secure = true;
          break;
        case 'samesite': {
          const normalized = valuePart.toLowerCase();
          if (normalized === 'strict' || normalized === 'lax' || normalized === 'none') {
            sameSite = normalized;
          }
          break;
        }
        case 'max-age': {
          const seconds = Number.parseInt(valuePart, 10);
          if (!Number.isNaN(seconds)) {
            expiresAt = Date.now() + seconds * 1000;
          }
          break;
        }
        case 'expires': {
          const ts = Date.parse(valuePart);
          if (!Number.isNaN(ts)) {
            expiresAt = ts;
          }
          break;
        }
        default:
          break;
      }
    }

    return {
      name,
      value,
      domain,
      path,
      hostOnly,
      secure,
      sameSite,
      expiresAt,
    };
  }

  private upsertClientCookie(cookieJar: WsClientCookie[], cookie: WsClientCookie): void {
    const index = cookieJar.findIndex(
      existing =>
        existing.name === cookie.name &&
        existing.domain === cookie.domain &&
        existing.path === cookie.path
    );
    if (index >= 0) {
      cookieJar[index] = cookie;
      return;
    }
    cookieJar.push(cookie);
  }

  private removeClientCookie(
    cookieJar: WsClientCookie[],
    name: string,
    domain: string,
    path: string
  ): void {
    const index = cookieJar.findIndex(
      existing => existing.name === name && existing.domain === domain && existing.path === path
    );
    if (index >= 0) {
      cookieJar.splice(index, 1);
    }
  }

  private isCookieExpired(cookie: WsClientCookie, now: number): boolean {
    return cookie.expiresAt !== undefined && cookie.expiresAt <= now;
  }

  private pathMatches(requestPath: string, cookiePath: string): boolean {
    if (!requestPath.startsWith(cookiePath)) {
      return false;
    }

    if (requestPath.length === cookiePath.length) {
      return true;
    }

    if (cookiePath.endsWith('/')) {
      return true;
    }

    return requestPath.charAt(cookiePath.length) === '/';
  }

  private defaultCookiePath(pathname: string): string {
    if (!pathname || !pathname.startsWith('/')) {
      return '/';
    }
    if (pathname === '/') {
      return '/';
    }

    const slashIndex = pathname.lastIndexOf('/');
    if (slashIndex <= 0) {
      return '/';
    }

    return pathname.slice(0, slashIndex);
  }

  private extractHostname(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) {
        return undefined;
      }
      return trimmed.split(':')[0];
    }
  }

  private extractOriginProtocol(origin?: string): string | undefined {
    if (!origin) {
      return undefined;
    }

    try {
      return new URL(origin).protocol.replace(':', '').toLowerCase();
    } catch {
      return undefined;
    }
  }

  private getSiteKey(host?: string): string | undefined {
    if (!host) {
      return undefined;
    }

    const labels = host.toLowerCase().split('.').filter(Boolean);
    if (labels.length < 2) {
      return host.toLowerCase();
    }
    return `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
  }

  private resolveLocalApiUrl(url?: string): string | null {
    if (!url) {
      return null;
    }

    try {
      const baseUrl = new URL(APP_CONFIG.api);
      const target = new URL(url, baseUrl);
      if (target.origin !== baseUrl.origin) {
        return null;
      }

      const internalApiBase = process.env['API_INTERNAL_URL']?.trim();
      if (internalApiBase) {
        const internalBaseUrl = new URL(internalApiBase);
        return `${internalBaseUrl.origin}${target.pathname}${target.search}`;
      }

      const protocol = this.isSSL ? 'https' : 'http';
      const isDefaultPort =
        (protocol === 'https' && this.options.port === 443) ||
        (protocol === 'http' && this.options.port === 80);
      const portSegment = isDefaultPort ? '' : `:${this.options.port}`;
      return `${protocol}://${this.options.host}${portSegment}${target.pathname}${target.search}`;
    } catch {
      return null;
    }
  }

  private resolveHttpMethod(request?: WsHttpRequestCommand['request']): string | null {
    const rawMethod = request?.method;
    if (typeof rawMethod === 'string' && rawMethod.trim().length > 0) {
      const normalizedMethod = rawMethod.toUpperCase();
      return ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)
        ? normalizedMethod
        : null;
    }

    const hasBody = typeof request?.body !== 'undefined' && request?.body !== null;
    return hasBody ? 'POST' : 'GET';
  }

  private handleBurstPingPong(message: BurstPingCommand, client: WsClientInterface) {
    if (message?.countdown > 1) {
      message.countdown--;
    }

    if (message?.countdown === 0 && message.started && message.start) {
      message.completed = new Date().getTime();
      const duration = message.completed - message.started;
      const perSecond = Math.floor((message.start / duration) * 1000);
      const avgMs = Math.floor((duration / message.start) * 1000) / 1000;

      this.reply(
        <BurstPingResultMessage>{
          event: 'burst-ping-result',
          message: 'burst ping result',
          original: message,
          duration,
          perSecond,
          avgMs,
        },
        client
      );

      this.reply(
        <ChatMessage>{
          author: {
            uuid: this.uuid,
            name: 'System',
          },
          event: 'chat',
          message: `Insgesamt wurden ${message.start} Pakete á 207 Bytes gewechselt und der Test in ${duration}ms beendet. Das entspricht in etwa ${perSecond} Pakete pro Sekunde oder ~${avgMs}ms Latenz.`,
          meta: {
            original: message,
            duration,
          },
        },
        client
      );
    } else {
      this.reply(message, client);
    }
  }

  private handleMessageEvents(client: WsClientInterface, message: WsMessages) {
    const created = this.timestamp();
    switch (message?.event) {
      case 'pong':
        client.rtt = created - message.created + (message?.rtt ?? 0);
        break;
    }
  }

  private handleMouseEvent(message: MouseCommand, client: WsClientInterface) {
    client.pointer = { ...message.data };
  }

  private handleTouchEvent(message: TouchCommand, client: WsClientInterface) {
    client.touch = { ...message.data };
  }

  private pushPointersData() {
    const clients = Array.from(this.clientMap.values()).filter(client => client.flags.hasPointer);
    if (clients.length > 0) {
      const pointers: WsClientPointerInterface[] = clients
        .filter(
          client => typeof client.pointer !== 'undefined' || typeof client.touch !== 'undefined'
        )
        .map(client => {
          return {
            uuid: client.uuid,
            user: { uuid: client.user?.uuid ?? client.uuid },
            pointer: client.pointer,
            touch: client.touch,
          };
        });
      clients.forEach(client => {
        const reply: Omit<PointerMessage, 'uuid' | 'created'> = {
          message: 'PointersData',
          event: 'pointer',
          pointers,
        };
        this.reply(reply, client);
      });
    }
  }

  private sendUpdateData(socket: WebSocket, current?: UpdateStatus) {
    const client = this.clientMap.get(socket);
    if (client) {
      const update = current && current.hash !== APP_CONFIG.hash;
      const message: Omit<UpdateMessage, 'uuid' | 'created'> = {
        event: 'update',
        message: 'current',
        update,
        current: {
          version: APP_CONFIG.version,
          hash: APP_CONFIG.hash,
        },
      };
      this.reply(message, client);
    }
  }

  private handleMe(socket: WebSocket, command?: UpdateMeCommand | MeCommand) {
    const client = this.clientMap.get(socket);
    if (client) {
      if (command?.command === 'updateMe') {
        const previous = client.user.name ?? client.user.uuid;
        const current = command.data.username ?? client.user.uuid;
        client.user.name = command.data.username;
        this.clientMap.set(socket, client);
        if (previous !== current) {
          this.broadcast({
            event: 'chat',
            message: `${previous} heißt jetzt ${current}`,
          });
        }
      }
      const message: Omit<MeMessage, 'uuid' | 'created'> = {
        event: 'me',
        message: 'current',
        data: <WsClientInterface>{
          uuid: client.uuid,
          created: client.created,
          seq: client.seq,
          rtt: client.rtt,
          user: client.user,
        },
      };
      this.reply(message, client);
    }
  }

  private pushClientsCount() {
    this.broadcast({
      event: 'clients',
      count: this.clientMap.size,
    });
  }
}
