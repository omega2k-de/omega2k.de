import '@angular/compiler';
import axios from 'axios';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WsServer } from './ws.server';

interface MockContentRepository {
  getPageByRoute: ReturnType<typeof vi.fn>;
  tree: ReturnType<typeof vi.fn>;
  getNavigation: ReturnType<typeof vi.fn>;
  getSitemapRoutes: ReturnType<typeof vi.fn>;
  getAllCards: ReturnType<typeof vi.fn>;
  getCards: ReturnType<typeof vi.fn>;
  getRandomCards: ReturnType<typeof vi.fn>;
}

interface MockLikesRepository {
  getState: ReturnType<typeof vi.fn>;
  toggle: ReturnType<typeof vi.fn>;
  getAllStates: ReturnType<typeof vi.fn>;
}

interface WsServerInternals {
  server: Server;
  wss: { close: () => void };
  _pingInterval: NodeJS.Timeout;
  _healthInterval: NodeJS.Timeout;
  _heartbeatInterval: NodeJS.Timeout;
  _pointerInterval: NodeJS.Timeout;
}

interface TestContext {
  baseUrl: string;
  content: MockContentRepository;
  likes: MockLikesRepository;
  wsServer: WsServer;
  close: () => Promise<void>;
}

const testContexts: TestContext[] = [];

const createContentRepository = (): MockContentRepository => ({
  getPageByRoute: vi.fn().mockReturnValue({
    route: '/content/test-article',
    isPublished: true,
    title: 'Test article',
  }),
  tree: vi.fn().mockReturnValue([]),
  getNavigation: vi.fn().mockReturnValue([]),
  getSitemapRoutes: vi.fn().mockReturnValue([]),
  getAllCards: vi.fn().mockReturnValue([]),
  getCards: vi.fn().mockReturnValue([]),
  getRandomCards: vi.fn().mockReturnValue([]),
});

const createLikesRepository = (): MockLikesRepository => ({
  getState: vi.fn().mockReturnValue({ articleId: 1, count: 0, liked: false }),
  toggle: vi.fn().mockReturnValue({ articleId: 1, count: 1, liked: true }),
  getAllStates: vi.fn().mockReturnValue([]),
});

const createServer = async (logger: 'OFF' | 'INFO' = 'OFF'): Promise<TestContext> => {
  const content = createContentRepository();
  const likes = createLikesRepository();
  const server = new WsServer(
    {
      ssl: false,
      logger,
      host: '127.0.0.1',
      port: 0,
      origin: 'http://127.0.0.1',
      version: '1.2.3',
      hash: 'abcdef12',
    },
    content as never,
    likes as never
  );
  const internals = server as unknown as WsServerInternals;

  if (!internals.server.listening) {
    await new Promise<void>(resolve => internals.server.once('listening', () => resolve()));
  }

  const address = internals.server.address() as AddressInfo | null;
  if (!address) {
    throw new Error('Websocket test server did not expose an address');
  }

  const context: TestContext = {
    baseUrl: `http://127.0.0.1:${address.port}`,
    content,
    likes,
    wsServer: server,
    close: async () => {
      clearInterval(internals._pingInterval);
      clearInterval(internals._healthInterval);
      clearInterval(internals._heartbeatInterval);
      clearInterval(internals._pointerInterval);
      internals.wss.close();
      await new Promise<void>(resolve => internals.server.close(() => resolve()));
    },
  };

  testContexts.push(context);
  return context;
};

afterEach(async () => {
  while (testContexts.length > 0) {
    const context = testContexts.pop();
    await context?.close();
  }
});

describe('WsServer HTTP api', () => {
  it('writes access logs on INFO level', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const context = await createServer('INFO');

    await axios.get(`${context.baseUrl}/privacy`);

    expect(
      infoSpy.mock.calls.some(call =>
        call.some(arg => typeof arg === 'string' && arg.includes('WsServer.access'))
      )
    ).toBe(true);
    infoSpy.mockRestore();
  });

  it('serves published content routes', async () => {
    const context = await createServer();

    const response = await axios.get(`${context.baseUrl}/content/test-article`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      route: '/content/test-article',
      isPublished: true,
      title: 'Test article',
    });
    expect(context.content.getPageByRoute).toHaveBeenCalledWith('/content/test-article');
  });

  it('returns 404 for unpublished content routes', async () => {
    const context = await createServer();
    context.content.getPageByRoute.mockReturnValue({
      route: '/content/draft-article',
      isPublished: false,
      title: 'Draft article',
    });

    const response = await axios.get(`${context.baseUrl}/content/draft-article`, {
      validateStatus: () => true,
    });

    expect(response.status).toBe(404);
    expect(response.data).toEqual({ error: 'not_found' });
    expect(context.content.getPageByRoute).toHaveBeenCalledWith('/content/draft-article');
  });

  it('creates a user cookie when toggling likes without an existing identity', async () => {
    const context = await createServer();
    context.likes.toggle.mockReturnValue({ articleId: 42, count: 1, liked: true });

    const response = await axios.post(`${context.baseUrl}/likes/42/toggle`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ articleId: 42, count: 1, liked: true });
    expect(context.likes.toggle).toHaveBeenCalledWith(42, expect.any(String));

    const cookieHeader = response.headers['set-cookie'];
    expect(cookieHeader).toHaveLength(1);
    expect(cookieHeader[0]).toContain('o2k_uid=');
    expect(cookieHeader[0]).toContain('HttpOnly');
    expect(cookieHeader[0]).toContain('SameSite=Lax');
    expect(cookieHeader[0]).not.toContain('Secure');
  });

  it('reads the user id from cookies for like state endpoints', async () => {
    const context = await createServer();
    context.likes.getState.mockReturnValue({ articleId: 7, count: 4, liked: true });

    const response = await axios.get(`${context.baseUrl}/likes/7`, {
      headers: {
        Cookie: 'o2k_uid=test%20user',
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ articleId: 7, count: 4, liked: true });
    expect(context.likes.getState).toHaveBeenCalledWith(7, 'test user');
  });

  it('returns parsed cookies via the privacy endpoint', async () => {
    const context = await createServer();

    const response = await axios.get(`${context.baseUrl}/privacy`, {
      headers: {
        Cookie: 'theme=light',
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      cookies: [{ key: 'theme', value: 'light' }],
    });
  });

  it('stores Set-Cookie values in websocket client cookie jar for follow-up requests', async () => {
    const context = await createServer();
    const wsServer = context.wsServer as unknown as {
      clientCookies: Map<string, Record<string, string>>;
      captureSetCookieHeaders: (client: { uuid: string }, headers: Headers) => void;
      resolveHttpMethod: (request?: { method?: string; body?: unknown }) => string | null;
      resolveUpstreamHeaders: (
        requestHeaders: Record<string, string> | undefined,
        client: { uuid: string; requestHeaders?: Record<string, string> },
        withCredentials?: boolean,
        method?: string,
        body?: unknown
      ) => Record<string, string>;
    };

    const client = { uuid: 'test-client', requestHeaders: {} };
    wsServer.clientCookies.set(client.uuid, {});

    const headers = new Headers();
    headers.append('set-cookie', 'o2k_uid=test-user; Path=/; HttpOnly; SameSite=Lax');
    wsServer.captureSetCookieHeaders(client, headers);

    const upstream = wsServer.resolveUpstreamHeaders(undefined, client, true, 'POST', {});
    expect(upstream.cookie).toBe('o2k_uid=test-user');
    expect(upstream['content-type']).toBe('application/json');
  });

  it('infers POST for websocket http-request without method but with body', async () => {
    const context = await createServer();
    const wsServer = context.wsServer as unknown as {
      resolveHttpMethod: (request?: { method?: string; body?: unknown }) => string | null;
    };

    expect(wsServer.resolveHttpMethod({ body: {} })).toBe('POST');
    expect(wsServer.resolveHttpMethod({})).toBe('GET');
  });

  it('rejects unsupported websocket http-request methods', async () => {
    const context = await createServer();
    const wsServer = context.wsServer as unknown as {
      resolveHttpMethod: (request?: { method?: string; body?: unknown }) => string | null;
    };

    expect(wsServer.resolveHttpMethod({ method: 'TRACE' })).toBeNull();
    expect(wsServer.resolveHttpMethod({ method: 'post' })).toBe('POST');
  });

  it('rejects empty random-card amounts', async () => {
    const context = await createServer();

    const response = await axios.get(`${context.baseUrl}/random-cards/0`, {
      validateStatus: () => true,
    });

    expect(response.status).toBe(400);
    expect(response.data).toEqual({ error: 'amount_required' });
    expect(context.content.getRandomCards).not.toHaveBeenCalled();
  });
});
