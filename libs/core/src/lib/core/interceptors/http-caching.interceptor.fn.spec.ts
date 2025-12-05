import {
  HttpClient,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { pairwise, take } from 'rxjs';
import { HttpCachingInterceptorFn } from './http-caching.interceptor.fn';
import { RequestCache } from '../interfaces/request-cache.interface';

describe('HttpCachingInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  const mockRequestCache: Partial<RequestCache> = {
    isCacheable: vi.fn().mockImplementation(request => request.url !== '/exclude/cache'),
    get: vi
      .fn()
      .mockImplementation((req: HttpRequest<unknown>): HttpResponse<unknown> | undefined => {
        switch (req.url) {
          case '/with/cache':
            return new HttpResponse<unknown>({
              body: { cached: 'response' },
            });
          default:
            return undefined;
        }
      }),
    set: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([HttpCachingInterceptorFn])),
        provideHttpClientTesting(),
        MockProvider(RequestCache, mockRequestCache),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.clearAllMocks();
  });

  it('should cache GET request', () => {
    const url = '/api/some/path';
    httpClient.get(url).subscribe();

    const req = httpTestingController.expectOne(url);
    req.flush({ data: { foo: 'bar' } });

    expect(mockRequestCache.set).toHaveBeenCalledTimes(1);
    expect(mockRequestCache.get).toHaveBeenCalledTimes(1);
  });

  it('should refresh cache', () => {
    const url = '/api/some/path';
    httpClient.get(url, { headers: { 'x-refresh': 'true' } }).subscribe();

    const req = httpTestingController.expectOne(url);
    req.flush({ data: { foo: 'bar' } });

    expect(req.request.headers.has('x-refresh')).toBe(false);
    expect(mockRequestCache.set).toHaveBeenCalledTimes(1);
    expect(mockRequestCache.get).toHaveBeenCalledTimes(1);
  });

  it('should return cache', () => {
    const url = '/with/cache';
    httpTestingController.expectNone(url);
    httpClient
      .get(url)
      .pipe(take(1))
      .subscribe(data => {
        expect(data).toStrictEqual({ cached: 'response' });
      });
  });

  it('should refresh current cache', () => {
    const url = '/with/cache';
    httpClient
      .get(url, { headers: { 'x-refresh': 'true' } })
      .pipe(pairwise())
      .subscribe(data => {
        expect(data[0]).toStrictEqual({ cached: 'response' });
        expect(data[1]).toStrictEqual({ data: { foo: 'bar' } });
      });

    const req = httpTestingController.expectOne(url);
    req.flush({ data: { foo: 'bar' } });

    expect(req.request.headers.has('x-refresh')).toBe(false);
    expect(mockRequestCache.set).toHaveBeenCalledTimes(1);
    expect(mockRequestCache.get).toHaveBeenCalledTimes(1);
  });

  it('should not cache excluded', () => {
    const url = '/exclude/cache';
    httpClient
      .get(url, { headers: { 'x-no-cache': 'true' } })
      .pipe(pairwise())
      .subscribe(data => {
        expect(data[0]).toStrictEqual({ cached: 'response' });
        expect(data[1]).toStrictEqual({ data: { foo: 'bar' } });
      });

    const req = httpTestingController.expectOne(url);
    req.flush({ data: { foo: 'bar' } });

    expect(req.request.headers.has('x-no-cache')).toBe(false);
    expect(mockRequestCache.set).toHaveBeenCalledTimes(0);
    expect(mockRequestCache.get).toHaveBeenCalledTimes(0);
  });
});
