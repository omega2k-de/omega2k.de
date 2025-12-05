import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { VpoObserveConfig } from './config.interface';
import { RootMarginInterface } from './root-margin.interface';

export type ConfigHash = string;
export type PooledObserverKey = string;

export type NormalizedCfg = Required<VpoObserveConfig> & {
  rootMargin: RootMarginInterface;
  hash: ConfigHash;
  key: PooledObserverKey;
};

export interface PooledObserver {
  io: IntersectionObserver;
  config: NormalizedCfg;
  updateSubscription?: Subscription;
  targets: Map<HTMLElement, PooledObserverSubjectRef>;
  configSubject: Subject<NormalizedCfg>;
  rootMarginSubject: Subject<RootMarginInterface>;
  refCountSubject: BehaviorSubject<number>;
  refCount: number;
}

export interface PooledObserverSubjectRef {
  entrySubject: Subject<IntersectionObserverEntry>;
  refCount: number;
}

export interface PooledObserverHandleInterface {
  get key(): PooledObserverKey;
  get config(): NormalizedCfg;
  get refCount(): number;
  update(config?: Partial<VpoObserveConfig>): void;
}

export interface ObserverHandleInterface extends PooledObserverHandleInterface {
  config$: Observable<NormalizedCfg>;
  entries$: Observable<IntersectionObserverEntry>;
  poolCount$?: Observable<number>;
  rootMargin$?: Observable<RootMarginInterface>;
  pool?: Map<PooledObserverKey, PooledObserver>;

  unobserve(): void;
}

export interface ObserverDebugHandleInterface extends ObserverHandleInterface {
  poolCount$: Observable<number>;
  rootMargin$: Observable<RootMarginInterface>;
  pool: Map<PooledObserverKey, PooledObserver>;
}
