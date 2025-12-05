import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  AutoIdDirective,
  IconDirective,
  ProgressRingDirective,
  UiProgressRingConfig,
  VibrateDirective,
} from '../../directives';
import {
  countdownAnimationFrame,
  ReadyStateMessages,
  UiIconType,
  WEBSOCKET_WORKER,
} from '@o2k/core';
import { filter, map, Subject, takeUntil, takeWhile } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { toSignal } from '@angular/core/rxjs-interop';

@UntilDestroy()
@Component({
  selector: 'ui-ws-state',
  imports: [VibrateDirective, IconDirective, AutoIdDirective, ProgressRingDirective],
  templateUrl: './ws-state.component.html',
  styleUrl: './ws-state.component.scss',
})
export class WsStateComponent implements OnInit, OnDestroy, AfterViewInit {
  protected readonly uiProgressRingConfig: UiProgressRingConfig = {
    overlayColor: 'rgba(0,0,0,0.05)',
    centerColor: 'var(--nm-surface)',
    trackColor: 'rgba(0,0,0,0.05)',
  };
  protected readonly pingTrigger = new Subject<void>();
  protected readonly isPinging = signal<boolean>(false);
  protected readonly progress = signal<number | null>(null);
  protected readonly stateEvents = ['open', 'error', 'close', 'readyState', 'reconnect'];
  protected readonly worker = inject(WEBSOCKET_WORKER);
  protected readonly state = signal<UiIconType>('cloud_off');
  protected readonly clients = toSignal(
    this.worker.message$.pipe(
      filter(
        message =>
          message.event === 'clients' || message.event === 'health' || message.event === 'heartbeat'
      ),
      map(message => {
        if (message.event === 'clients') {
          return message.count ?? 0;
        } else if (message.health.clients) {
          return message.health.clients;
        }
        return 0;
      }),
      untilDestroyed(this)
    ),
    { initialValue: 0 }
  );

  ngAfterViewInit(): void {
    this.worker.postMessage({ command: 'readyState' });
  }

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
    if (this.progress() === 0 && this.state() === 'network_node') {
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

  ngOnInit(): void {
    this.worker.message$
      .pipe(
        filter(message => this.stateEvents.includes(message.event)),
        map(message => (message as ReadyStateMessages)?.state ?? WebSocket.CLOSED),
        untilDestroyed(this)
      )
      .subscribe(state => this.mapState(state));
  }

  private mapState(state: number) {
    switch (state) {
      case WebSocket.CONNECTING:
        this.state.set('plug_connect');
        break;
      case WebSocket.OPEN:
        this.state.set('network_node');
        break;
      case WebSocket.CLOSING:
        this.state.set('pending');
        break;
      case WebSocket.CLOSED:
        this.state.set('cloud_off');
        break;
    }
  }
}
