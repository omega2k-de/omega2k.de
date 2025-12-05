import { inject, Injectable, isDevMode } from '@angular/core';
import { SwUpdate, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import {
  BehaviorSubject,
  debounceTime,
  defaultIfEmpty,
  forkJoin,
  from,
  Subscription,
  tap,
  withLatestFrom,
} from 'rxjs';
import { LoggerService } from '../logger';
import { NotifyTypes, UpdateStatus } from '../interfaces';
import { NotificationService } from './notification.service';
import { CONFIG, WINDOW } from '../tokens';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface UpdateInformationInterface {
  status: UpdateStatus;
  update: boolean;
}

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private unrecoverableSub?: Subscription;
  private versionUpdatesSub?: Subscription;

  private swUpdate = inject(SwUpdate);
  private router = inject(Router);
  private loggerService = inject(LoggerService);
  private notificationService = inject(NotificationService);

  private window = inject(WINDOW);
  private readonly config = inject(CONFIG, { optional: true });
  private readonly appHash = this.config?.hash ?? null;
  private readonly appVersion = this.config?.version ?? '0.0.0';

  private readonly updateSubject = new BehaviorSubject<UpdateInformationInterface>({
    status: { version: this.appVersion, hash: this.appHash },
    update: false,
  });
  private readonly update$ = this.updateSubject
    .asObservable()
    .pipe(distinctUntilChanged((a, b) => a.update === b.update && a.status.hash === b.status.hash));

  flushOfflineContent() {
    if (!this.window || !('caches' in this.window)) {
      return;
    }

    const window = this.window;
    from(window.caches.keys())
      .pipe(
        mergeMap(keys =>
          forkJoin(
            keys
              .filter(key => key.includes('data:offline-content'))
              .map(key => from(window.caches.delete(key)))
          )
        ),
        defaultIfEmpty(null)
      )
      .subscribe({
        next: () => {
          this.loggerService.info(
            'PwaUpdateService',
            'refreshOfflineContentCache() done, reloading'
          );
          this.window?.location.reload();
        },
        error: e => {
          this.loggerService.error('PwaUpdateService', 'refreshOfflineContentCache() error', { e });
        },
      });
  }

  enable(): void {
    if (!this.swUpdate.isEnabled) {
      this.loggerService.info('PwaUpdateService', 'ServiceWorker not enabled', {
        isDevMode: isDevMode(),
      });
      return;
    }

    if (this.unrecoverableSub) {
      this.loggerService.warn('PwaUpdateService', 'already enabled');
      return;
    }

    this.unrecoverableSub = this.swUpdate.unrecoverable
      .pipe(withLatestFrom(this.update$), untilDestroyed(this))
      .subscribe(([e, data]: [UnrecoverableStateEvent, UpdateInformationInterface]) => {
        this.loggerService.error('PwaUpdateService', 'unrecoverable', { e, data });
        this.notifyClient();
      });

    this.versionUpdatesSub = this.swUpdate.versionUpdates
      .pipe(
        withLatestFrom(this.update$),
        tap(([e, data]) =>
          this.loggerService.log('PwaUpdateService', 'versionUpdates', { e, data })
        ),
        debounceTime(10000),
        untilDestroyed(this)
      )
      .subscribe(([e, data]: [VersionEvent, UpdateInformationInterface]) => {
        if (data.update) {
          this.notifyClient(data.status);
        } else if (e.type !== 'NO_NEW_VERSION_DETECTED') {
          this.notifyClient();
        }
      });
  }

  disable(): void {
    this.unrecoverableSub?.unsubscribe();
    this.unrecoverableSub = undefined;
    this.versionUpdatesSub?.unsubscribe();
    this.versionUpdatesSub = undefined;
  }

  checkForUpdate(status: UpdateStatus, update?: boolean): void {
    if (!this.swUpdate.isEnabled) {
      this.loggerService.info('PwaUpdateService', 'checkForUpdate() updates disabled');
      return;
    }

    if (update !== true && this.appHash === status.hash) {
      this.loggerService.info('PwaUpdateService', 'checkForUpdate() already updated');
      return;
    }

    this.updateSubject.next({ status, update: update === true });
    this.swUpdate
      .checkForUpdate()
      .then()
      .catch(e => {
        this.loggerService.error('PwaUpdateService', 'checkForUpdate() error, forced reload', {
          e,
        });
      });
  }

  async activateAndReload(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      this.loggerService.info('PwaUpdateService', 'activateAndReload() updates disabled');
      return;
    }

    try {
      this.loggerService.info(
        'PwaUpdateService',
        'activateAndReload() calling update.activateUpdate()'
      );
      await this.swUpdate.activateUpdate();
    } catch (e) {
      this.loggerService.error('PwaUpdateService', 'activateAndReload() error, forced reload', {
        e,
      });
    }
    this.flushOfflineContent();
  }

  private notifyClient(status?: UpdateStatus) {
    if (status) {
      this.notifyUpdate(status);
    } else {
      this.blockingReload(
        'Beim automatischen Update ist wohl etwas schief gegangen. Kein Problem, einmal Neuladen sollte das Problem beheben. Bitte den Browser einmal neu laden.'
      );
    }
  }

  private notifyUpdate(status?: UpdateStatus) {
    const n: NotifyTypes = {
      type: 'growl',
      title: `Update ${status?.version ?? ' '} verfügbar`,
      created: Date.now(),
      important: true,
      message: `Neue Version ${status?.version ?? ' '}${status?.hash ? `@${status.hash} ` : ''}ist bereit zur Aktivierung. Nach einmal Neuladen ist alles wieder aktuell.`,
      data: null,
      icon: 'stat_3',
      timeoutMs: 60_000,
      clearTimeoutOnExpand: true,
      applyIcon: 'more_time',
      applyTitle: 'um 1 Minute verschieben...',
      onApply: () => setTimeout(() => this.notifyUpdate(status), 60_000),
      cancelIcon: 'check',
      cancelTitle: 'Update aktivieren',
      onCancel: () => setTimeout(async () => await this.activateAndReload(), 0),
    };
    this.notificationService.notify(n);
  }

  private blockingReload(message: string): void {
    const n: NotifyTypes = {
      type: 'growl',
      title: 'Update installiert',
      created: Date.now(),
      important: true,
      message,
      data: null,
      icon: 'autorenew',
      timeoutMs: 60_000,
      clearTimeoutOnExpand: true,
      applyIcon: 'more_time',
      applyTitle: 'um 1 Minute verschieben...',
      onApply: () => setTimeout(() => this.blockingReload(message), 60_000),
      cancelIcon: 'autorenew',
      cancelTitle: 'Browser neuladen',
      onCancel: () => setTimeout(() => this.window?.location.reload(), 16),
    };
    this.notificationService.notify(n);
  }
}
