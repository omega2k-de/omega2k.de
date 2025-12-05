import { HttpRequest, HttpResponse } from '@angular/common/http';
import { ApplicationConfig, inject, Injectable, InjectionToken } from '@angular/core';
import { NONE_CACHEABLE_URLS } from '../interceptors/http-caching.interceptor.fn';
import { RequestCache, RequestCacheEntryInterface } from '../interfaces';

export const REQUEST_CACHE_MAX_AGE_MS = new InjectionToken<number | null>('RequestCacheMaxAgeMs');

@Injectable()
export class RequestCacheService implements RequestCache {
  private maxAge: number | null = inject(REQUEST_CACHE_MAX_AGE_MS, {
    optional: true,
  });
  private readonly noneCacheableUrls = inject(NONE_CACHEABLE_URLS);
  private cache = new Map<string, RequestCacheEntryInterface>();

  get(req: HttpRequest<unknown>): HttpResponse<unknown> | undefined {
    if (this.maxAge === null) {
      return undefined;
    }

    const url = req.urlWithParams;
    const cached = this.cache.get(url);

    if (!cached) {
      return undefined;
    }

    const isExpired = cached.lastRead < Date.now() - this.maxAge;
    return isExpired ? undefined : cached.response;
  }

  isCacheable(req: HttpRequest<unknown>): boolean {
    return (
      req.method === 'GET' &&
      !this.noneCacheableUrls.includes(req.url) &&
      null === req.headers.get('x-no-cache')
    );
  }

  set(req: HttpRequest<unknown>, response: HttpResponse<unknown>): void {
    if (this.maxAge === null) {
      return;
    }

    if (response.status !== 200) {
      return;
    }

    const url = req.urlWithParams;

    const newEntry = { url, response, lastRead: Date.now() };
    this.cache.set(url, newEntry);

    const expired = Date.now() - this.maxAge;
    this.cache.forEach(entry => {
      if (entry.lastRead < expired) {
        this.cache.delete(entry.url);
      }
    });
  }
}

export const provideRequestCache = (): ApplicationConfig['providers'] => [
  { provide: REQUEST_CACHE_MAX_AGE_MS, useValue: 86_400_000 },
  { provide: RequestCache, useClass: RequestCacheService },
];
