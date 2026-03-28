import { HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { v4 as uuidV4 } from 'uuid';
import { Observable, of, Subject, timeout } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CONFIG } from '../tokens';
import { WEBSOCKET_WORKER, WsHttpResponseMessage } from '../websocket';

@Injectable({ providedIn: 'root' })
export class WebsocketHttpBridgeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config = inject(CONFIG);
  private readonly worker = inject(WEBSOCKET_WORKER);

  private websocketConnected = false;
  private readonly pending = new Map<string, Subject<WsHttpResponseMessage>>();

  constructor() {
    this.worker.message$.subscribe(message => {
      if (message.event === 'open') {
        this.websocketConnected = true;
      }

      if (message.event === 'close' || message.event === 'error') {
        this.websocketConnected = false;
      }

      if (message.event === 'http-response') {
        const subject = this.pending.get(message.requestId);
        if (subject) {
          subject.next(message);
          subject.complete();
          this.pending.delete(message.requestId);
        }
      }
    });
  }

  canHandle(request: HttpRequest<unknown>): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    if (!this.websocketConnected) {
      return false;
    }

    if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
      return false;
    }

    return this.isApiRequest(request.url);
  }

  execute(
    request: HttpRequest<unknown>,
    timeoutMs: number
  ): Observable<HttpResponse<unknown> | null> {
    if (!this.canHandle(request)) {
      return of(null);
    }

    const requestId = uuidV4().toString();
    const responseSubject = new Subject<WsHttpResponseMessage>();
    this.pending.set(requestId, responseSubject);

    this.worker.postMessage({
      command: 'http-request',
      request: {
        requestId,
        method: request.method as 'GET' | 'HEAD',
        url: request.urlWithParams,
        headers: this.toHeadersRecord(request.headers),
        withCredentials: request.withCredentials,
      },
    });

    return responseSubject.asObservable().pipe(
      take(1),
      map(response => this.toHttpResponse(response)),
      timeout({
        first: timeoutMs,
        with: () => {
          this.pending.delete(requestId);
          return of(null);
        },
      })
    );
  }

  private toHttpResponse(response: WsHttpResponseMessage): HttpResponse<unknown> {
    return new HttpResponse({
      body: response.body,
      status: response.status,
      statusText: response.ok ? 'OK' : response.error || 'WebSocket request failed',
      url: response.url,
      headers: new HttpHeaders(response.headers ?? {}),
    });
  }

  private isApiRequest(url: string): boolean {
    try {
      const targetUrl = new URL(url, this.config.url);
      const apiUrl = new URL(this.config.api);
      return targetUrl.origin === apiUrl.origin;
    } catch {
      return false;
    }
  }

  private toHeadersRecord(headers: HttpHeaders): Record<string, string> | undefined {
    const keys = headers.keys();
    if (!keys.length) {
      return undefined;
    }

    const record: Record<string, string> = {};
    keys.forEach(key => {
      const value = headers.get(key);
      if (value !== null) {
        record[key] = value;
      }
    });
    return record;
  }
}
