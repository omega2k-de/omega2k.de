import {
  HttpContext,
  HttpContextToken,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WebsocketHttpBridgeService } from '../services/websocket-http-bridge.service';

export const WS_HTTP_WRAPPER_ENABLED = new HttpContextToken<boolean>(() => true);
export const WS_HTTP_TIMEOUT_MS = new InjectionToken<number>('WS HTTP timeout in ms', {
  providedIn: 'root',
  factory: () => 3_000,
});

export const withWsHttpWrapperDisabled = () =>
  new HttpContext().set(WS_HTTP_WRAPPER_ENABLED, false);

export const WebsocketHttpInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (!req.context.get(WS_HTTP_WRAPPER_ENABLED)) {
    return next(req);
  }

  const bridge = inject(WebsocketHttpBridgeService);
  const timeoutMs = inject(WS_HTTP_TIMEOUT_MS);
  return bridge
    .execute(req, timeoutMs)
    .pipe(switchMap(response => (response ? of(response) : next(req))));
};
