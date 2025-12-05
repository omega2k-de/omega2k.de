import { Component, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { countdownAnimationFrame, NetworkService, WEBSOCKET_WORKER } from '@o2k/core';
import {
  AutoIdDirective,
  IconDirective,
  ProgressRingDirective,
  UiProgressRingConfig,
  VibrateDirective,
} from '../../directives';
import { filter, map, Subject, takeUntil, takeWhile } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ui-network-state',
  imports: [IconDirective, VibrateDirective, ProgressRingDirective, AutoIdDirective],
  templateUrl: './network-state.component.html',
  styleUrl: './network-state.component.scss',
})
export class NetworkStateComponent implements OnDestroy {
  protected readonly uiProgressRingConfig: UiProgressRingConfig = {
    overlayColor: 'rgba(0,0,0,0.05)',
    centerColor: 'var(--nm-surface)',
    trackColor: 'rgba(0,0,0,0.05)',
  };
  protected pingTrigger = new Subject<void>();
  protected worker = inject(WEBSOCKET_WORKER);
  protected networkService = inject(NetworkService);
  protected readonly isOnline = toSignal(this.networkService.isOnline$, { initialValue: true });
  protected readonly isPinging = signal<boolean>(false);
  protected readonly progress = signal<number | null>(null);

  ngOnDestroy(): void {
    this.pingTrigger.complete();
  }

  debounceTimePing() {
    this.pingTrigger.next();
    this.progress.set(1);
    countdownAnimationFrame(2000)
      .pipe(takeUntil(this.pingTrigger), untilDestroyed(this))
      .subscribe({
        next: p => this.progress.set(p),
        complete: () => this.triggerBurstPingWithProgress(),
      });
  }

  private triggerBurstPingWithProgress() {
    if (this.progress() === 0 && this.isOnline()) {
      this.isPinging.set(true);
      this.progress.set(0);
      this.worker.message$
        .pipe(
          filter(message => message.event === 'burst-ping-pong'),
          map(message => message.countdown),
          takeWhile(v => v > 0, true),
          takeUntil(this.pingTrigger),
          untilDestroyed(this)
        )
        .subscribe({
          next: countdown => this.progress.set(1 - countdown / 100),
          complete: () => {
            this.progress.set(null);
            this.isPinging.set(false);
          },
        });
      this.worker.burstPing(100);
      return;
    }
    this.progress.set(null);
    this.isPinging.set(false);
  }
}
