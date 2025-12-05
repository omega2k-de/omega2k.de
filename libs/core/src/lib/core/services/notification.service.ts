import { effect, inject, Injectable, NgZone, signal } from '@angular/core';
import dayjs from 'dayjs';
import {
  BehaviorSubject,
  combineLatest,
  interval,
  map,
  noop,
  ReplaySubject,
  share,
  startWith,
} from 'rxjs';
import { NotificationTypes, NotifyTypes } from '../interfaces/notify.interface';
import { v4 as uuidV4 } from 'uuid';
import { LocalStorageService } from './local-storage.service';

type TId = string;
type TimeoutId = ReturnType<typeof setTimeout>;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly localNotificationsEnabled = signal<boolean>(true);

  private readonly storage = inject(LocalStorageService);
  private readonly zone: NgZone = inject(NgZone);
  private readonly clockMs = 1000;
  private readonly state$ = new BehaviorSubject<Map<TId, NotificationTypes>>(new Map());
  private readonly timers = new Map<TId, TimeoutId>();

  private readonly now$ = interval(this.clockMs).pipe(
    startWith(0),
    map(() => Date.now()),
    share({ connector: () => new ReplaySubject<number>(1), resetOnRefCountZero: false })
  );

  readonly notifications$ = combineLatest([this.state$, this.now$]).pipe(
    map(([mapState, now]) => {
      const list: NotificationTypes[] = [];
      if (!this.localNotificationsEnabled()) {
        return list;
      }
      mapState.forEach(n => {
        const span = n.expiresAt - n.startedAt;
        const p = Number.isFinite(n.expiresAt)
          ? Math.min(1, Math.max(0, (now - n.startedAt) / Math.max(1, span)))
          : 0;
        list.push({ ...n, progress: p });
      });
      list.sort((a, b) => a.startedAt - b.startedAt);
      return list;
    })
  );

  constructor() {
    this.zone.runOutsideAngular(() => this.now$.subscribe());
    effect(() => this.storage.save('notify', this.localNotificationsEnabled() ? 'true' : 'false'));
  }

  toggleNotifications(enabled?: boolean): void {
    if (typeof enabled === 'boolean') {
      this.localNotificationsEnabled.set(enabled);
    } else {
      this.localNotificationsEnabled.set(!this.localNotificationsEnabled());
    }
  }

  notify(n: NotifyTypes) {
    const id = n.id ?? uuidV4.toString();
    const ttl = n.timeoutMs ?? 0;
    const expiresAt = ttl > 0 ? n.created + ttl : Number.POSITIVE_INFINITY;
    if (this.alreadyExpired(expiresAt)) {
      if (n?.onRemove) {
        n.onRemove();
      }
      return;
    }
    const entity: NotificationTypes = {
      progress: 0,
      ...n,
      id,
      date: dayjs(n.created, 'milliseconds'),
      startedAt: n.created,
      expiresAt,
      onApply: () => {
        if (n?.onApply) {
          n.onApply();
        }
        this.remove(id);
      },
      onCancel: (manual?: boolean) => {
        if (n?.onCancel) {
          n.onCancel(manual);
        }
        this.remove(id);
      },
      onExpand: () => {
        if (n?.onExpand) {
          n.onExpand();
        }
        if (n.clearTimeoutOnExpand) {
          this.clearTimeout(id);
          entity.progress = 0;
          entity.expiresAt = Number.POSITIVE_INFINITY;
        }
      },
      onRemove: n?.onRemove ? n.onRemove : noop,
    };
    const next = new Map(this.state$.value);
    next.set(id, entity);
    this.state$.next(next);
    this.scheduleRemoval(entity);
  }

  remove(id: string) {
    const next = new Map(this.state$.value);
    const entry = next.get(id);
    entry?.onRemove();
    if (next.delete(id)) {
      this.state$.next(next);
    }
    this.clearTimeout(id);
  }

  clearAll() {
    this.state$.next(new Map());
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  private alreadyExpired(expiresAt: number) {
    return Number.isFinite(expiresAt) && Date.now() >= expiresAt;
  }

  private clearTimeout(id: string) {
    const t = this.timers.get(id);
    if (t) {
      clearTimeout(t);
      this.timers.delete(id);
    }
  }

  private scheduleRemoval(n: NotificationTypes) {
    if (Number.isFinite(n.expiresAt)) {
      const ms = Math.max(0, n.expiresAt - Date.now());
      const t = setTimeout(() => n.onCancel(false), ms);
      this.timers.set(n.id, t);
    }
  }
}
