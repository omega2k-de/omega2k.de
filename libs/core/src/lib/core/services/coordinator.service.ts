import { inject, Injectable, signal } from '@angular/core';
import { LoggerService } from '../logger';
import { PwaUpdateService } from './pwa-update.service';
import { WEBSOCKET_WORKER } from '../websocket';
import { NotificationService } from './notification.service';
import { debounceTime, filter, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import dayjs from 'dayjs';
import { NotifyTypes } from '../interfaces';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import { DOCUMENT } from '@angular/common';
import { NetworkService } from './network.service';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isLeapYear);

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class CoordinatorService {
  private doc = inject(DOCUMENT);
  private logger = inject(LoggerService);
  private pwa = inject(PwaUpdateService);
  private network = inject(NetworkService);
  private worker = inject(WEBSOCKET_WORKER);
  private notify = inject(NotificationService);

  private readonly asideOpen = signal<boolean>(false);
  readonly isAsideOpen = this.asideOpen.asReadonly();

  private readonly navigationOpen = signal<boolean>(false);
  readonly isNavigationOpen = this.navigationOpen.asReadonly();

  constructor() {
    this.worker.message$
      .pipe(
        filter(message => message.event === 'health'),
        untilDestroyed(this)
      )
      .subscribe(message => {
        const duration = dayjs
          .duration(message.health.uptime, 'seconds')
          .format('Y[y] M[m] D[d] H[h] m[m] s[s]');
        const notification: NotifyTypes = {
          id: message.uuid,
          created: message.created,
          type: 'health',
          title: `Uptime: ${duration}`,
          icon: 'heart_check',
          data: message.health,
          clearTimeoutOnExpand: true,
          important: false,
          timeoutMs: 60_000,
        };
        this.notify.notify(notification);
      });

    this.worker.message$
      .pipe(
        filter(message => message.event === 'update'),
        tap(message =>
          this.logger.info('CoordinatorService', 'update', {
            current: message.current,
            update: message.update,
          })
        ),
        untilDestroyed(this)
      )
      .subscribe(message => this.pwa.checkForUpdate(message.current, message.update));

    this.worker.message$
      .pipe(
        filter(message => message.event === 'burst-ping-result'),
        untilDestroyed(this)
      )
      .subscribe(message => {
        const notification: NotifyTypes = {
          id: message.uuid,
          created: message.created,
          type: 'growl',
          important: true,
          title: `Ping Test ~${message.avgMs}ms`,
          message: `Insgesamt wurden ${message.original.start} Pakete á 207 Bytes gewechselt und der Test in ${message.duration}ms beendet. Das entspricht in etwa ${message.perSecond} Pakete pro Sekunde oder ~${message.avgMs}ms Latenz.`,
          icon: 'vital_signs',
          clearTimeoutOnExpand: true,
          data: null,
          timeoutMs: 60_000,
        };
        this.notify.notify(notification);
      });

    this.worker.message$
      .pipe(
        filter(message => message.event === 'open' || message.event === 'close'),
        tap(message => this.logger.info('CoordinatorService', 'websocket', message.event)),
        filter(message => message.event === 'open'),
        debounceTime(3000),
        untilDestroyed(this)
      )
      .subscribe(() => this.worker.version());

    this.network.isOnline$.pipe(untilDestroyed(this)).subscribe(online => {
      if (online) {
        this.worker.openSocket();
      } else {
        this.worker.closeSocket();
      }
    });
  }

  enable() {
    this.logger.info('CoordinatorService', 'enabled');
    this.doc.body.setAttribute('coordinator', 'enabled');
  }

  disable() {
    this.logger.info('CoordinatorService', 'disabled');
    this.doc.body.setAttribute('coordinator', 'disabled');
  }

  toggleAsideOverlay(show?: boolean) {
    if (typeof show === 'boolean') {
      this.asideOpen.set(show);
    } else {
      this.asideOpen.set(!this.asideOpen());
    }

    this.doc.documentElement.setAttribute('data-aside', String(this.asideOpen()));
  }

  toggleNavigationOverlay(show?: boolean) {
    if (typeof show === 'boolean') {
      this.navigationOpen.set(show);
    } else {
      this.navigationOpen.set(!this.navigationOpen());
    }

    this.doc.documentElement.setAttribute('data-navigation', String(this.navigationOpen()));
  }
}
