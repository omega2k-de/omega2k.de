import { HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { REQUEST_CACHE_MAX_AGE_MS, RequestCacheService } from './request-cache.service';
import { NONE_CACHEABLE_URLS } from '../interceptors/http-caching.interceptor.fn';

describe('RequestCacheService', () => {
  let service: RequestCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RequestCacheService,
        {
          provide: REQUEST_CACHE_MAX_AGE_MS,
          useValue: 150,
        },
        {
          provide: NONE_CACHEABLE_URLS,
          useValue: [],
        },
      ],
    });
  });

  it('should be created', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      expect(requestCacheService).toBeTruthy();
    }
  ));

  it('should return undefined on empty cache', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      const request = new HttpRequest('GET', '/some/url');
      expect(requestCacheService.get(request)).toStrictEqual(undefined);
    }
  ));

  it('should return undefined on missing injection token', () => {
    // prepare
    const request = new HttpRequest('GET', '/some/url');
    const response = new HttpResponse({
      body: 'foo',
      status: 200,
      statusText: 'OK',
      url: '/some/url',
    });
    TestBed.overrideProvider(REQUEST_CACHE_MAX_AGE_MS, { useValue: null });
    service = TestBed.inject(RequestCacheService);

    // act
    service.set(request, response);

    // assert
    expect(service.get(request)).toStrictEqual(undefined);
  });

  it('should delete entry from cache on expire', fakeAsync(() => {
    // prepare
    const request1 = new HttpRequest('GET', '/some/url1');
    const response1 = new HttpResponse({
      body: 'foo1',
      status: 200,
      statusText: 'OK',
      url: '/some/url1',
    });
    const request2 = new HttpRequest('GET', '/some/url2');
    const response2 = new HttpResponse({
      body: 'foo2',
      status: 200,
      statusText: 'OK',
      url: '/some/url2',
    });
    TestBed.overrideProvider(REQUEST_CACHE_MAX_AGE_MS, { useValue: 50 });
    service = TestBed.inject(RequestCacheService);

    // act
    service.set(request1, response1);

    // assert
    expect(service.get(request1)).toStrictEqual(response1);
    tick(100);

    service.set(request2, response2);
    expect(service.get(request1)).toStrictEqual(undefined);
    expect(service.get(request2)).toStrictEqual(response2);
  }));

  it('should return cached entry', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      // prepare
      const request = new HttpRequest('GET', '/some/url');
      const response = new HttpResponse({
        body: 'foo',
        status: 200,
        statusText: 'OK',
        url: '/some/url',
      });

      // act
      requestCacheService.set(request, response);

      // assert
      expect(requestCacheService.get(request)).toStrictEqual(response);
    }
  ));

  it('should return undefined on cache expired', fakeAsync(
    inject([RequestCacheService], (requestCacheService: RequestCacheService) => {
      // prepare
      const request = new HttpRequest('GET', '/some/url');
      const response = new HttpResponse({
        body: 'foo',
        status: 200,
        statusText: 'OK',
        url: '/some/url',
      });

      // act
      requestCacheService.set(request, response);

      // assert
      tick(200);
      expect(requestCacheService.get(request)).toStrictEqual(undefined);
    })
  ));

  it('should not save status !== 200', fakeAsync(
    inject([RequestCacheService], (requestCacheService: RequestCacheService) => {
      // prepare
      const request = new HttpRequest('GET', '/some/url');
      const response = new HttpResponse({
        body: 'does not matter',
        status: 404,
        statusText: 'NOT FOUND',
        url: '/some/url',
      });

      // act
      requestCacheService.set(request, response);

      // assert
      tick(200);
      expect(requestCacheService.get(request)).toStrictEqual(undefined);
    })
  ));

  it('returns true for GET, not on noneCacheable list, and without x-no-cache header', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      const req = new HttpRequest('GET', '/ok/url');
      expect(requestCacheService.isCacheable(req)).toBe(true);
    }
  ));

  it('returns false for non-GET methods', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      const post = new HttpRequest('POST', '/ok/url', null);
      const put = new HttpRequest('PUT', '/ok/url', null);
      const del = new HttpRequest('DELETE', '/ok/url');
      expect(requestCacheService.isCacheable(post)).toBe(false);
      expect(requestCacheService.isCacheable(put)).toBe(false);
      expect(requestCacheService.isCacheable(del)).toBe(false);
    }
  ));

  it('returns false if URL is in NONE_CACHEABLE_URLS', () => {
    TestBed.overrideProvider(NONE_CACHEABLE_URLS, { useValue: ['/blocked'] });
    const svc = TestBed.inject(RequestCacheService);
    const req = new HttpRequest('GET', '/blocked');
    expect(svc.isCacheable(req)).toBe(false);
  });

  it('returns false if x-no-cache header is present (even empty string)', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      const req = new HttpRequest('GET', '/ok/url', {
        headers: new HttpHeaders({ 'x-no-cache': '' }),
      });
      expect(requestCacheService.isCacheable(req)).toBe(false);
    }
  ));

  it('distinguishes legacy-entries by urlWithParams (query params produce different keys)', inject(
    [RequestCacheService],
    (requestCacheService: RequestCacheService) => {
      const r1 = new HttpRequest('GET', '/some/url', {
        params: new HttpParams({ fromObject: { a: '1' } }),
      });
      const r2 = new HttpRequest('GET', '/some/url', {
        params: new HttpParams({ fromObject: { a: '2' } }),
      });

      const res1 = new HttpResponse({ status: 200, body: 'v1', url: '/some/url?a=1' });
      const res2 = new HttpResponse({ status: 200, body: 'v2', url: '/some/url?a=2' });

      requestCacheService.set(r1, res1);
      expect(requestCacheService.get(r1)).toStrictEqual(res1);
      expect(requestCacheService.get(r2)).toBeUndefined();

      requestCacheService.set(r2, res2);
      expect(requestCacheService.get(r1)).toStrictEqual(res1);
      expect(requestCacheService.get(r2)).toStrictEqual(res2);
    }
  ));

  it('does nothing when REQUEST_CACHE_MAX_AGE_MS is null (set/get no-ops)', () => {
    const req = new HttpRequest('GET', '/no/cache');
    const res = new HttpResponse({ status: 200, body: 'x', url: '/no/cache' });

    TestBed.overrideProvider(REQUEST_CACHE_MAX_AGE_MS, { useValue: null });
    const svc = TestBed.inject(RequestCacheService);

    svc.set(req, res);
    expect(svc.get(req)).toBeUndefined();
  });
});
