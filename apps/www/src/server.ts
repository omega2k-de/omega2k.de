/* eslint-disable no-console */
import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import dayjs from 'dayjs';
import express, { Express, NextFunction, Request, Response } from 'express';
import os from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import xmlbuilder from 'xmlbuilder';
import { APP_CONFIG, collectNavigableLoadComponentPaths } from '@o2k/core';
import { appRoutes } from './app/app.routes';
import { monitorEventLoopDelay } from 'perf_hooks';
import { isDevMode } from '@angular/core';
import { formatAccessLogLine, shouldLogAccess } from './access-log.util';

const { ssr_port, url, socket, api, version, hash, nonce } = APP_CONFIG;
const browserDistFolder = join(import.meta.dirname, '../browser');
const routes = collectNavigableLoadComponentPaths(appRoutes);
const staticRoutes = routes.filter(route => !route.startsWith('/content'));
const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();
const DEFAULT_ALLOWED_HOSTS = ['omega2k.de', 'www.omega2k.de', '*.omega2k.de'];
const runtimeLoggerLevel = (
  process.env['SSR_LOG_LEVEL'] ??
  process.env['COMPOSE_LOGGER'] ??
  APP_CONFIG.logger
).toUpperCase();

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
}

function logServerError(stage: string, req: Request, error: unknown): void {
  const normalized = normalizeError(error);
  console.error('[E]', '[WwwServer.error]', {
    stage,
    method: req.method,
    url: req.originalUrl || req.url,
    message: normalized.message,
    stack: normalized.stack,
    cause: normalized.cause,
  });
}

function parseAllowedHostsFromEnv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

function getAllowedHosts(): string[] {
  const fromEnv = parseAllowedHostsFromEnv(process.env['NG_ALLOWED_HOSTS']);
  return Array.from(new Set([...DEFAULT_ALLOWED_HOSTS, ...fromEnv]));
}

async function loadContentRoutesFromApi(): Promise<string[]> {
  const internalApi = process.env['API_INTERNAL_URL']?.trim();
  const base = (internalApi || api || url).replace(/\/+$/g, '');
  const response = await fetch(`${base}/sitemap-routes`);
  if (!response.ok) {
    throw new Error(`sitemap-routes request failed with status ${response.status}`);
  }
  const data = (await response.json()) as { routes?: string[] };
  const list = data.routes ?? [];
  return Array.from(new Set(list)).sort();
}

const allowedOrigins: string[] = [
  url,
  'https://omega2k.de',
  'https://www.omega2k.de',
  'https://x.com',
  'https://threadcreator.com',
].filter((v, i, a) => a.indexOf(v) === i);

const headerMap = new Map<string, string>([
  ['Access-Control-Allow-Origin', url],
  ['Access-Control-Allow-Credentials', 'true'],
  ['Vary', 'Origin'],
  ['Cache-Control', 'no-cache, must-revalidate'],
  ['Cross-Origin-Opener-Policy', 'same-origin-allow-popups'],
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
  ['X-Frame-Options', 'SAMEORIGIN'],
  ['X-Content-Type-Options', '1; mode=block'],
  ['X-XSS-Protection', 'on'],
  ['Referrer-Policy', 'strict-origin'],
]);

export function ssrServer(): Express {
  const app = express();
  app.disable('x-powered-by');
  const angularApp = new AngularNodeAppEngine({
    allowedHosts: getAllowedHosts(),
  });

  if (isDevMode()) {
    headerMap.set(
      'Content-Security-Policy',
      `default-src 'self' ${url}; script-src 'self' 'unsafe-inline' ${url}; style-src 'self' 'unsafe-inline' ${url}; worker-src 'self' ${url}; connect-src 'self' ${socket} ${api};`
    );
  } else {
    headerMap.set(
      'Content-Security-Policy',
      `default-src 'self' ${url}; base-uri ${url}; script-src 'nonce-${nonce}' ${url}; style-src 'self' 'unsafe-inline' ${url}; worker-src 'self' ${url}; connect-src 'self' ${socket} ${api};`
    );
  }

  app.use(
    compression({
      level: 8,
      threshold: 0,
      filter: (req, res) =>
        req.headers['x-no-compression'] ? false : compression.filter(req, res),
    })
  );

  const options: CorsOptions = {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    origin: allowedOrigins,
    maxAge: 60,
    exposedHeaders: ['Content-Encoding'],
    allowedHeaders: ['Origin', 'Range', 'Accept', 'Content-Type', 'Authorization'],
  };

  app.use(cors(options));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (shouldLogAccess(runtimeLoggerLevel)) {
    console.info('[I]', '[WwwServer.config]', {
      logger: runtimeLoggerLevel,
      api: process.env['API_INTERNAL_URL']?.trim() || api,
      socket,
      url,
    });
  }

  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
      if (shouldLogAccess(runtimeLoggerLevel)) {
        const line = formatAccessLogLine(
          req.method,
          req.originalUrl || req.url,
          res.statusCode,
          Date.now() - started
        );
        console.info('[I]', '[WwwServer.access]', line);
      }
    });
    next();
  });

  app.get('/_health', (_, res) => {
    const eventLoopDelayMs = (histogram.mean / 1.0e6).toFixed(2);
    const loadAvg = os.loadavg();
    res
      .status(200)
      .type('json')
      .send({
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
        version,
        hash,
      });
  });

  app.get('/sitemap.xml', (_req, res) => {
    void loadContentRoutesFromApi()
      .then(contentRoutes => {
        const allRoutes = Array.from(new Set([...staticRoutes, ...contentRoutes])).sort();

        const root = xmlbuilder.create('urlset', { version: '1.0', encoding: 'UTF-8' });
        root.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

        const lastmod = dayjs().format('YYYY-MM-DD');

        allRoutes.forEach(routePath => {
          const xmlUrl = root.ele('url');
          xmlUrl.ele('loc', `${url}${routePath}`);
          xmlUrl.ele('lastmod', lastmod);
        });

        res.header('Content-Type', 'application/xml');
        res.send(root.end({ pretty: true }));
      })
      .catch(err => {
        console.error(`GET /sitemap.xml error`, err);
        res.status(500).type('text/plain').send('Sitemap generation failed');
      });
  });

  app.use((req, res, next) => {
    if (/\.(?:avif|webp|png|jpe?g|gif|svg|ico)$/i.test(req.path)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Timing-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeaders(headerMap);
    }
    res.locals['cspNonce'] = nonce;
    res.locals['url'] = url;
    next();
  });

  /**
   * Serve static files from /browser
   */
  app.set('view engine', 'html');
  app.set('views', browserDistFolder);

  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      immutable: true,
      redirect: false,
    })
  );

  /**
   * Handle all other requests by rendering the Angular application.
   */
  app.use((req, res, next) => {
    angularApp
      .handle(req, { nonce, url })
      .then(response => (response ? writeResponseToNodeResponse(response, res) : next()))
      .catch(err => {
        logServerError('angular.handle', req, err);
        next(err);
      });
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    logServerError('express.error-middleware', req, err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).type('text/plain').send('Internal Server Error');
  });

  return app;
}

const app = ssrServer();

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  app.listen(ssr_port, () => {
    console.log(`Node Express server listening on ${url}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
