import WebSocket from 'ws';
import { randomUUID } from 'crypto';

interface WsHttpResponse {
  event: 'http-response';
  requestId: string;
  ok: boolean;
  status: number;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

interface HealthResponse {
  message: string;
  uptime: number;
  usage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  version: string;
  hash: string | null;
}

function getWsUrl(): string {
  const baseUrl = getHttpBaseUrl();
  if (baseUrl.startsWith('https://')) {
    return baseUrl.replace(/^https:/, 'wss:');
  }
  if (baseUrl.startsWith('http://')) {
    return baseUrl.replace(/^http:/, 'ws:');
  }
  return baseUrl;
}

function getHttpBaseUrl(): string {
  const configured = process.env['WEBSOCKET_E2E_BASE_URL']?.trim();
  if (configured) {
    return configured.replace(/\/+$/g, '');
  }

  const port = process.env['API_PORT']?.trim() || '42080';
  return `https://127.0.0.1:${port}`;
}

function getBridgeApiOrigin(): string {
  const override = process.env['WS_BRIDGE_API_ORIGIN']?.trim();
  if (override) {
    return override.replace(/\/+$/g, '');
  }

  const configuredApi = process.env['API']?.trim();
  if (configuredApi) {
    try {
      return new URL(configuredApi).origin;
    } catch {
      // ignore and continue with fallback
    }
  }

  const localBase = getHttpBaseUrl();
  if (localBase) {
    try {
      return new URL(localBase).origin;
    } catch {
      // ignore and continue with fallback
    }
  }

  const port = process.env['API_PORT']?.trim() || '42080';
  return `https://api.omega2k.de.o2k:${port}`;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const values = typeof getSetCookie === 'function' ? getSetCookie.call(headers) : [];
  if (values.length) {
    return values;
  }
  const fallback = headers.get('set-cookie');
  return fallback ? [fallback] : [];
}

async function fetchJson<T = unknown>(
  pathOrUrl: string,
  init?: RequestInit & { jsonBody?: unknown }
): Promise<{ status: number; headers: Headers; data: T }> {
  const target = pathOrUrl.startsWith('http') ? pathOrUrl : `${getHttpBaseUrl()}${pathOrUrl}`;
  const headers = new Headers(init?.headers);

  if (typeof init?.jsonBody !== 'undefined' && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(target, {
    ...init,
    headers,
    body: typeof init?.jsonBody !== 'undefined' ? JSON.stringify(init.jsonBody) : init?.body,
  });
  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? ((await response.json()) as T)
    : ((await response.text()) as T);

  return {
    status: response.status,
    headers: response.headers,
    data,
  };
}

async function openWsClient(): Promise<WebSocket> {
  const wsUrl = getWsUrl();
  const client = new WebSocket(wsUrl, {
    rejectUnauthorized: false,
  });

  await new Promise<void>((resolve, reject) => {
    const onOpen = () => {
      client.off('error', onError);
      resolve();
    };
    const onError = (error: Error) => {
      client.off('open', onOpen);
      reject(error);
    };
    client.once('open', onOpen);
    client.once('error', onError);
  });

  return client;
}

async function sendWsHttpRequest(
  client: WebSocket,
  request: {
    method: 'GET' | 'POST';
    url: string;
    withCredentials: boolean;
    body?: unknown;
  }
): Promise<WsHttpResponse> {
  const requestId = randomUUID();

  const result = await new Promise<WsHttpResponse>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for websocket http-response for ${requestId}`));
    }, 5_000);

    const onMessage = (raw: WebSocket.RawData) => {
      try {
        const message = JSON.parse(raw.toString()) as Partial<WsHttpResponse>;
        if (message.event !== 'http-response' || message.requestId !== requestId) {
          return;
        }
        cleanup();
        resolve(message as WsHttpResponse);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      client.off('message', onMessage);
      client.off('error', onError);
    };

    client.on('message', onMessage);
    client.once('error', onError);
    client.send(
      JSON.stringify({
        command: 'http-request',
        request: {
          requestId,
          method: request.method,
          url: request.url,
          withCredentials: request.withCredentials,
          body: request.body,
        },
      })
    );
  });

  return result;
}

describe('API backend', () => {
  it('GET /_health should return a message', async () => {
    const res = await fetchJson<HealthResponse>('/_health');

    expect(res.status).toStrictEqual(200);
    expect(res.headers.get('content-type')).toStrictEqual('application/json; charset=utf-8');
    expect(res.data.message).toEqual('OK');
    expect(res.data.uptime).toBeGreaterThan(0);
    expect(res.data.usage).toEqual(expect.any(Object));
    expect(res.data.usage['rss']).toBeGreaterThan(0);
    expect(res.data.usage['heapTotal']).toBeGreaterThan(0);
    expect(res.data.usage['heapUsed']).toBeGreaterThan(0);
    expect(res.data.usage['external']).toBeGreaterThan(0);
    expect(res.data.usage['arrayBuffers']).toBeGreaterThan(0);
    expect(res.data.version).toMatch(
      /^(?:[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?|[0-9a-f]{8})$/i
    );
    if (null !== res.data.hash) {
      expect(res.data.hash).toMatch(/^([0-9a-f]{8})$/i);
    }
  });

  it('GET /privacy should expose the cookies sent by the client', async () => {
    const res = await fetchJson<{ cookies: Array<{ key: string; value: string }> }>('/privacy', {
      headers: {
        Cookie: 'theme=light',
      },
    });

    expect(res.status).toStrictEqual(200);
    expect(res.data).toEqual({
      cookies: [{ key: 'theme', value: 'light' }],
    });
  });

  it('POST /likes/:articleId/toggle should create a cookie and persist like state', async () => {
    const articleId = Date.now();

    const toggleRes = await fetchJson<{ articleId: number; count: number; liked: boolean }>(
      `/likes/${articleId}/toggle`,
      {
        method: 'POST',
      }
    );

    expect(toggleRes.status).toStrictEqual(200);
    expect(toggleRes.data).toEqual({
      articleId,
      count: 1,
      liked: true,
    });

    const setCookie = getSetCookieHeaders(toggleRes.headers);
    expect(setCookie).toBeDefined();
    expect(setCookie).toHaveLength(1);

    const cookieHeader = setCookie?.[0];
    expect(cookieHeader).toContain('o2k_uid=');

    const cookie = cookieHeader?.split(';')[0];
    expect(cookie).toBeTruthy();
    if (!cookie) {
      throw new Error('Expected Set-Cookie to include cookie value');
    }

    const stateRes = await fetchJson<{ articleId: number; count: number; liked: boolean }>(
      `/likes/${articleId}`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    expect(stateRes.status).toStrictEqual(200);
    expect(stateRes.data).toEqual({
      articleId,
      count: 1,
      liked: true,
    });

    const listRes = await fetchJson<Array<{ articleId: number; count: number; liked: boolean }>>(
      `/likes`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    expect(listRes.status).toStrictEqual(200);
    expect(listRes.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          articleId,
          count: 1,
          liked: true,
        }),
      ])
    );
  });

  it('websocket http-request should handle likes toggle and persisted identity with credentials', async () => {
    const articleId = Date.now() + 101;
    const client = await openWsClient();
    const baseUrl = getBridgeApiOrigin();

    try {
      const toggleRes = await sendWsHttpRequest(client, {
        method: 'POST',
        url: `${baseUrl}/likes/${articleId}/toggle`,
        withCredentials: true,
        body: {},
      });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.ok).toBe(true);
      expect(toggleRes.body).toEqual(
        expect.objectContaining({
          articleId,
          liked: true,
        })
      );

      const stateRes = await sendWsHttpRequest(client, {
        method: 'GET',
        url: `${baseUrl}/likes/${articleId}`,
        withCredentials: true,
      });

      expect(stateRes.status).toBe(200);
      expect(stateRes.body).toEqual(
        expect.objectContaining({
          articleId,
          liked: true,
        })
      );
    } finally {
      client.close();
    }
  });

  it('websocket http-request should not persist identity when withCredentials is false', async () => {
    const articleId = Date.now() + 202;
    const client = await openWsClient();
    const baseUrl = getBridgeApiOrigin();

    try {
      const toggleRes = await sendWsHttpRequest(client, {
        method: 'POST',
        url: `${baseUrl}/likes/${articleId}/toggle`,
        withCredentials: false,
        body: {},
      });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.ok).toBe(true);

      const stateRes = await sendWsHttpRequest(client, {
        method: 'GET',
        url: `${baseUrl}/likes/${articleId}`,
        withCredentials: true,
      });

      expect(stateRes.status).toBe(200);
      expect(stateRes.body).toEqual(
        expect.objectContaining({
          articleId,
          liked: false,
        })
      );
    } finally {
      client.close();
    }
  });
});
