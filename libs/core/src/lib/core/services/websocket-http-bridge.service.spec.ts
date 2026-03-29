import { HttpRequest } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Subject } from 'rxjs';
import { provideConfig } from '../tokens';
import { WEBSOCKET_WORKER, WebsocketWorker, WsMessages } from '../websocket';
import { WebsocketHttpBridgeService } from './websocket-http-bridge.service';

describe('WebsocketHttpBridgeService', () => {
  let message$: Subject<WsMessages>;
  const workerMock: Pick<WebsocketWorker, 'message$' | 'postMessage'> = {
    message$: new Subject<WsMessages>().asObservable(),
    postMessage: vi.fn(),
  };

  beforeEach(() => {
    message$ = new Subject<WsMessages>();
    workerMock.message$ = message$.asObservable();
    workerMock.postMessage = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideConfig({
          api: 'https://api.omega2k.de',
          url: 'https://www.omega2k.de',
          socket: 'wss://api.omega2k.de',
        }),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: WEBSOCKET_WORKER, useValue: workerMock },
        WebsocketHttpBridgeService,
      ],
    });
  });

  it('returns null when websocket is not connected', async () => {
    const service = TestBed.inject(WebsocketHttpBridgeService);
    const req = new HttpRequest('POST', 'https://api.omega2k.de/likes/1/toggle', {});

    const result = await firstValueFrom(service.execute(req, 100));

    expect(result).toBeNull();
    expect(workerMock.postMessage).not.toHaveBeenCalled();
  });

  it('routes POST requests through websocket when connected', async () => {
    const service = TestBed.inject(WebsocketHttpBridgeService);
    message$.next({
      event: 'open',
      state: WebSocket.OPEN,
      url: 'wss://api.omega2k.de',
      created: Date.now(),
      uuid: 'open-1',
    });

    const req = new HttpRequest('POST', 'https://api.omega2k.de/likes/42/toggle', { liked: true });
    const pending = firstValueFrom(service.execute(req, 1_000));

    const posted = (workerMock.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      request: { requestId: string };
    };
    expect(posted.command).toBe('http-request');
    expect(posted.request.method).toBe('POST');
    expect(posted.request.body).toEqual({ liked: true });

    message$.next({
      event: 'http-response',
      requestId: posted.request.requestId,
      ok: true,
      status: 200,
      url: req.urlWithParams,
      body: { ok: true },
      created: Date.now(),
      uuid: 'response-1',
    });

    const response = await pending;
    expect(response?.status).toBe(200);
    expect(response?.body).toEqual({ ok: true });
  });

  it('never uses websocket transport on server platform (SSR)', async () => {
    TestBed.resetTestingModule();
    const serverStream = new Subject<WsMessages>();
    const serverWorkerMock: Pick<WebsocketWorker, 'message$' | 'postMessage'> = {
      message$: serverStream.asObservable(),
      postMessage: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideConfig({
          api: 'https://api.omega2k.de',
          url: 'https://www.omega2k.de',
          socket: 'wss://api.omega2k.de',
        }),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: WEBSOCKET_WORKER, useValue: serverWorkerMock },
        WebsocketHttpBridgeService,
      ],
    });

    const service = TestBed.inject(WebsocketHttpBridgeService);
    const req = new HttpRequest('POST', 'https://api.omega2k.de/likes/1/toggle', {});
    const result = await firstValueFrom(service.execute(req, 500));

    expect(result).toBeNull();
    expect(serverWorkerMock.postMessage).not.toHaveBeenCalled();
  });
});
