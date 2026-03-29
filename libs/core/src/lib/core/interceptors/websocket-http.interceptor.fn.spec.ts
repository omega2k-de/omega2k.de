import {
  HttpClient,
  HttpContext,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { WebsocketHttpBridgeService } from '../services/websocket-http-bridge.service';
import {
  WebsocketHttpInterceptorFn,
  WS_HTTP_WRAPPER_ENABLED,
} from './websocket-http.interceptor.fn';

describe('WebsocketHttpInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  const bridgeMock: Pick<WebsocketHttpBridgeService, 'execute'> = {
    execute: vi.fn().mockReturnValue(of(null)),
  };

  beforeEach(() => {
    bridgeMock.execute = vi.fn().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([WebsocketHttpInterceptorFn])),
        provideHttpClientTesting(),
        MockProvider(WebsocketHttpBridgeService, bridgeMock),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('falls back to HTTP when websocket bridge returns null', () => {
    const url = 'https://api.omega2k.de/content';
    const next = vi.fn();

    httpClient.get(url).subscribe(next);

    expect(bridgeMock.execute).toHaveBeenCalledTimes(1);
    const req = httpTestingController.expectOne(url);
    req.flush({ via: 'http' });

    expect(next).toHaveBeenCalledWith({ via: 'http' });
  });

  it('returns websocket response and skips HTTP request', () => {
    const url = 'https://api.omega2k.de/content';
    const wsResponse = new HttpResponse({ status: 200, body: { via: 'ws' }, url });
    bridgeMock.execute = vi.fn().mockReturnValue(of(wsResponse));

    const next = vi.fn();
    httpClient.get(url).subscribe(next);

    expect(bridgeMock.execute).toHaveBeenCalledTimes(1);
    httpTestingController.expectNone(url);
    expect(next).toHaveBeenCalledWith({ via: 'ws' });
  });

  it('prioritizes websocket for POST requests as well', () => {
    const url = 'https://api.omega2k.de/likes/42/toggle';
    const wsResponse = new HttpResponse({ status: 200, body: { liked: true }, url });
    bridgeMock.execute = vi.fn().mockReturnValue(of(wsResponse));
    const next = vi.fn();

    httpClient.post(url, {}).subscribe(next);

    expect(bridgeMock.execute).toHaveBeenCalledTimes(1);
    const executeSpy = bridgeMock.execute as ReturnType<typeof vi.fn>;
    expect(executeSpy.mock.calls[0][0].method).toBe('POST');
    httpTestingController.expectNone(url);
    expect(next).toHaveBeenCalledWith({ liked: true });
  });

  it('supports opt-out via request context token', () => {
    const url = 'https://api.omega2k.de/content';
    const next = vi.fn();

    httpClient
      .get(url, {
        context: new HttpContext().set(WS_HTTP_WRAPPER_ENABLED, false),
      })
      .subscribe(next);

    expect(bridgeMock.execute).toHaveBeenCalledTimes(0);
    const req = httpTestingController.expectOne(url);
    req.flush({ via: 'http' });

    expect(next).toHaveBeenCalledWith({ via: 'http' });
  });
});
