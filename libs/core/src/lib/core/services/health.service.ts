import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, of, Subject, Subscription, switchMap, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { CONFIG } from '../tokens';
import { ConfigInterface, HealthStatus } from '../interfaces';
import { PlatformService } from './platform.service';

export const HEALTH_CHECK_INTERVAL = new InjectionToken<number>('Health Check Interval in ms', {
  providedIn: 'root',
  factory: () => 20_000,
});

export const HEALTH_CHECK_DELAY = new InjectionToken<number>('Health Check Initial Delay in ms', {
  providedIn: 'root',
  factory: () => 10_000,
});

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private interval: number = inject(HEALTH_CHECK_INTERVAL);
  private delay: number = inject(HEALTH_CHECK_DELAY);

  private platformService = inject(PlatformService);
  private config: ConfigInterface = inject(CONFIG);
  private httpClient: HttpClient = inject(HttpClient);
  private healthSubscription: Subscription | null = null;
  private statusSubject = new Subject<HealthStatus | null>();

  readonly status$ = this.statusSubject
    .asObservable()
    .pipe(distinctUntilChanged((a, b) => a?.uptime === b?.uptime));

  get enabled(): boolean {
    return this.healthSubscription !== null;
  }

  enable() {
    if (this.platformService.isBrowser && null === this.healthSubscription) {
      this.healthSubscription = timer(this.delay, this.interval)
        .pipe(switchMap(() => this.getHealth()))
        .subscribe(status => this.statusSubject.next(status));
    }
    return of(true);
  }

  disable() {
    this.healthSubscription?.unsubscribe();
    this.healthSubscription = null;
  }

  getHealth() {
    return this.httpClient
      .get<HealthStatus>(`${this.config.api}/_health`, { headers: { 'x-refresh': 'true' } })
      .pipe(catchError(() => of(null)));
  }
}
