import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { JsonHelper } from '../helpers';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  /**
   * all pending requests
   */
  private readonly pendingRequests: Map<string, HttpRequest<unknown>> = new Map();

  /**
   * internal loading state
   */
  private readonly loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * publish loading state of all pending calls with delay(0) to prevent "expression has changed after it was checked"
   */
  public readonly isLoading$: Observable<boolean> = this.loading
    .asObservable()
    .pipe(distinctUntilChanged(), delay(0));

  /**
   * convert request to unique string
   */
  private static getKey(request: HttpRequest<unknown>): string {
    return [request.method, request.urlWithParams, JsonHelper.stringify(request.body)].join('|');
  }

  /**
   * add new pending request
   */
  public add(request: HttpRequest<unknown>) {
    this.pendingRequests.set(LoadingService.getKey(request), request);
    this.updateLoadingState();
  }

  /**
   * remove pending request
   */
  public remove(request: HttpRequest<unknown>) {
    this.pendingRequests.delete(LoadingService.getKey(request));
    this.updateLoadingState();
  }

  /**
   * publish new pending state
   */
  private updateLoadingState() {
    this.loading.next(this.pendingRequests.size > 0);
  }
}
