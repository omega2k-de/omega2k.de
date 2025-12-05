import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { Observable, of, startWith, tap } from 'rxjs';
import { RequestCache } from '../interfaces/request-cache.interface';

export const NONE_CACHEABLE_URLS = new InjectionToken<string[]>('List of urls not being cached', {
  providedIn: 'root',
  factory: () => [],
});

const sendRequestAndUpdateCache = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  cache: RequestCache
): Observable<HttpEvent<unknown>> =>
  next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req, event);
      }
    })
  );

export const HttpCachingInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const cache = inject(RequestCache);
  if (cache.isCacheable(req)) {
    const cachedResponse = cache.get(req);

    if (req.headers.get('x-refresh')) {
      const results$ = sendRequestAndUpdateCache(
        req.clone({ headers: req.headers.delete('x-refresh') }),
        next,
        cache
      );
      return cachedResponse ? results$.pipe(startWith(cachedResponse)) : results$;
    }

    return cachedResponse ? of(cachedResponse) : sendRequestAndUpdateCache(req, next, cache);
  }
  return next(req.clone({ headers: req.headers.delete('x-no-cache') }));
};
