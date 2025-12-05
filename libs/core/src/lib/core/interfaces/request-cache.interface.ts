import { HttpRequest, HttpResponse } from '@angular/common/http';

export interface RequestCacheEntryInterface {
  url: string;
  response: HttpResponse<unknown>;
  lastRead: number;
}

export interface RequestCacheInterface {
  isCacheable(req: HttpRequest<unknown>): boolean;

  get(req: HttpRequest<unknown>): HttpResponse<unknown> | undefined;

  set(req: HttpRequest<unknown>, response: HttpResponse<unknown>): void;
}

export abstract class RequestCache implements RequestCacheInterface {
  abstract get(req: HttpRequest<unknown>): HttpResponse<unknown> | undefined;

  abstract isCacheable(req: HttpRequest<unknown>): boolean;

  abstract set(req: HttpRequest<unknown>, response: HttpResponse<unknown>): void;
}
