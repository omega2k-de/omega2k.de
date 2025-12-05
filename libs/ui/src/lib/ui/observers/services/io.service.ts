import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { JsonHelper, LoggerService } from '@o2k/core';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  noop,
  of,
  Subject,
} from 'rxjs';
import { Md5 } from 'ts-md5';
import { RootMarginFactory } from '../factories';
import { VpoObserveConfig, VpoObserveRootMargins } from '../interfaces/config.interface';
import {
  ConfigHash,
  NormalizedCfg,
  ObserverHandleInterface,
  PooledObserver,
  PooledObserverHandleInterface,
  PooledObserverKey,
  PooledObserverSubjectRef,
} from '../interfaces/io.service.interface';
import { RootMarginInterface } from '../interfaces/root-margin.interface';
import { VoService } from './vo.service';

@Injectable({
  providedIn: 'root',
})
export class IoService {
  private logger: LoggerService = inject(LoggerService);
  private rootMarginFactory: RootMarginFactory = inject(RootMarginFactory);
  private voService: VoService = inject(VoService);
  private platformId = inject(PLATFORM_ID);
  private configKeyMap = new Map<ConfigHash, PooledObserverKey>();
  private pool = new Map<PooledObserverKey, PooledObserver>();

  private setupTrackerMs = 0;
  private setupTrackerSubject = new Subject<void>();

  constructor() {
    this.setupTrackerSubject
      .asObservable()
      .pipe(debounceTime(1000))
      .subscribe(() => {
        const targetCount = [...this.pool.values()]
          .map(value => value.refCount)
          .reduce((p, c) => p + c, 0);
        this.logger.info(
          'IoService',
          'observe',
          `took ${Math.round(this.setupTrackerMs)} ms for ${this.pool.size} observers and ${targetCount} targets.`
        );
        this.setupTrackerMs = 0;
      });
  }

  configure(key: string, config: VpoObserveConfig): PooledObserverHandleInterface {
    if (!isPlatformBrowser(this.platformId)) {
      return {
        update: noop,
        get key(): string {
          return '';
        },
        get config(): NormalizedCfg {
          return {} as NormalizedCfg;
        },
        get refCount(): number {
          return 0;
        },
      };
    }

    const start = performance.now();
    const normalizedConfig = this.normalize({ ...config, key });
    const pooled = this.getOrCreatePooledObserver(normalizedConfig);

    const handle = {
      update: (config?: VpoObserveConfig) => this.update(pooled.config.key, config),
      get key(): string {
        return pooled.config.key;
      },
      get config(): NormalizedCfg {
        return pooled.config;
      },
      get refCount(): number {
        return pooled.refCount;
      },
    };

    this.setupTrackerMs += performance.now() - start;
    this.setupTrackerSubject.next();
    return handle;
  }

  listen<T extends ObserverHandleInterface>(target: HTMLElement, key: string, debug = false): T {
    if (!isPlatformBrowser(this.platformId)) {
      return this.getSsrHandle(debug);
    }

    const start = performance.now();
    const observer = this.pool.get(key);
    if (!observer) {
      this.logger.error('IoService', 'listen', `Config not found`);
      return this.getSsrHandle(debug);
    }

    return this.createHandle({ observer, target, start, debug });
  }

  observe<T extends ObserverHandleInterface>(target: HTMLElement, config: VpoObserveConfig): T {
    if (!isPlatformBrowser(this.platformId)) {
      return this.getSsrHandle(true === config.debug);
    }

    const start = performance.now();
    const normalizedConfig = this.normalize(config);
    const observer = this.getOrCreatePooledObserver(normalizedConfig);

    return this.createHandle({ observer, target, start });
  }

  update(key: string, config?: VpoObserveConfig): void {
    const observer = this.pool.get(key);
    if (observer) {
      const merged: VpoObserveConfig = { ...observer.config, ...config };
      const update = this.normalize(merged);
      if (observer.config.hash !== update.hash) {
        this.updateObserverConfig(update);
      }
    }
  }

  private createHandle<T extends ObserverHandleInterface>(options: {
    observer: PooledObserver;
    target: HTMLElement;
    start: number;
    debug?: boolean;
  }) {
    const info = this.attachTargetToObserver(options.observer, options.target);
    const handle = {
      get key(): string {
        return options.observer.config.key;
      },
      entries$: info.entrySubject.asObservable(),
      config$: options.observer.configSubject.asObservable(),
      update: (config?: VpoObserveConfig) => this.update(options.observer.config.key, config),
      unobserve: () => this.unobserveTarget(options.observer.config.key, options.target),
      get config(): NormalizedCfg | null {
        return options.observer.config;
      },
      get refCount(): number {
        return options.observer.refCount;
      },
    };

    if (options.debug || options.observer.config.debug) {
      const debugHandle: T = {
        ...handle,
        pool: this.pool,
        rootMargin$: options.observer.rootMarginSubject.asObservable(),
        poolCount$: options.observer.refCountSubject
          .asObservable()
          .pipe(distinctUntilChanged((a, b) => a === b)),
      } as T;
      this.setupTrackerMs += performance.now() - options.start;
      this.setupTrackerSubject.next();
      return debugHandle as T;
    }

    this.setupTrackerMs += performance.now() - options.start;
    this.setupTrackerSubject.next();
    return handle as T;
  }

  private attachTargetToObserver(observer: PooledObserver, target: HTMLElement) {
    let info = observer.targets.get(target);
    if (!info) {
      info = { entrySubject: new Subject<IntersectionObserverEntry>(), refCount: 0 };
      observer.targets.set(target, info);
      observer.io.observe(target);
    }

    info.refCount++;
    observer.refCount++;
    observer.refCountSubject.next(observer.refCount);
    return info;
  }

  private getSsrHandle<T extends ObserverHandleInterface>(debug = false): T {
    const entries = new Subject<IntersectionObserverEntry>();
    const config = new Subject<NormalizedCfg | null>();
    entries.complete();
    config.complete();
    const handle = {
      key: 'SSR',
      entries$: entries.asObservable(),
      config$: config.asObservable(),
      update: noop,
      unobserve: noop,
      get config(): NormalizedCfg | null {
        return null;
      },
      get refCount(): number {
        return 0;
      },
    };

    if (debug) {
      const subj = new Subject<RootMarginInterface>();
      subj.complete();
      return {
        ...handle,
        poolCount$: of(0),
        rootMargin$: subj.asObservable(),
        pool: this.pool,
      } as unknown as T;
    }

    return handle as T;
  }

  private ioFactory(config: NormalizedCfg): IntersectionObserver {
    const callback: IntersectionObserverCallback = this.ioCallback.bind(this, config.key);
    const options: IntersectionObserverInit = this.extractIoInit(config);
    return new IntersectionObserver(callback, options);
  }

  private getOrCreatePooledObserver(config: NormalizedCfg): PooledObserver {
    const existing = this.pool.get(config.key);
    if (existing) {
      return existing;
    }

    const io = this.ioFactory(config);
    return this.createPooledObserver(io, config);
  }

  private createPooledObserver(io: IntersectionObserver, config: NormalizedCfg) {
    const observer: PooledObserver = {
      io,
      config,
      updateSubscription: of().subscribe(),
      refCountSubject: new BehaviorSubject<number>(0),
      configSubject: new Subject<NormalizedCfg>(),
      rootMarginSubject: new Subject<RootMarginInterface>(),
      targets: new Map<HTMLElement, PooledObserverSubjectRef>(),
      refCount: 0,
    };

    observer.configSubject.next(config);
    this.recreateUpdateSubscription(observer, config);
    this.voService.observe(config.root);
    this.pool.set(config.key, observer);
    return observer;
  }

  private recreateUpdateSubscription(observer: PooledObserver, update: NormalizedCfg) {
    observer.updateSubscription?.unsubscribe();
    observer.updateSubscription = this.voService.tick$
      .pipe(
        map(() => this.pool.get(update.key)),
        filter(observer => !!observer),
        map(observer => observer.config),
        filter(config => {
          const rootMargin = config.rootMargin.toString(0);
          config.rootMargin.viewPort = this.rootMarginFactory.viewPort(update.root);
          config.rootMargin.extraMargins = update.extraMargins;
          observer.rootMarginSubject.next(update.rootMargin);
          return rootMargin !== update.rootMargin.toString(0);
        })
      )
      .subscribe(update => this.updateObserverConfig(update));
  }

  private unobserveTarget(key: string, target: HTMLElement): void {
    const p = this.pool.get(key);
    if (!p) {
      return;
    }

    const info = p.targets.get(target);
    if (info) {
      info.refCount--;
      if (info.refCount <= 0) {
        p.io.unobserve(target);
        info.entrySubject.complete();
        p.targets.delete(target);
      }
    }

    p.refCount--;
    if (p.refCount <= 0 || p.targets.size === 0) {
      this.voService.unobserve(p.config.root);
      p.rootMarginSubject.complete();
      p.rootMarginSubject.unsubscribe();
      p.updateSubscription?.unsubscribe();
      p.targets.clear();
      p.io.disconnect();
      this.pool.delete(key);
      this.configKeyMap.delete(p.config.hash);
    }
  }

  private updateObserverConfig(config: NormalizedCfg): void {
    const observer = this.pool.get(config.key);
    if (observer) {
      observer.config = config;
      observer.configSubject.next(config);
      this.rebuildInPlace(observer, config);
      this.recreateUpdateSubscription(observer, config);
      observer.rootMarginSubject.next(config.rootMargin);
    }
  }

  private rebuildInPlace(observer: PooledObserver, config: NormalizedCfg) {
    for (const [target] of observer.targets) {
      observer.io.unobserve(target);
    }

    observer.io.disconnect();
    observer.io = this.ioFactory(config);

    for (const [target] of observer.targets) {
      observer.io.observe(target);
    }
  }

  private extractIoInit(
    update: Pick<NormalizedCfg, 'root' | 'rootMargin' | 'threshold'>
  ): IntersectionObserverInit {
    return {
      root: update.root,
      rootMargin: update.rootMargin.toString(0),
      threshold: update.threshold,
    };
  }

  private ioCallback(key: string, entries: IntersectionObserverEntry[]) {
    const observer = this.pool.get(key);
    if (observer) {
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLElement)) {
          continue;
        }
        const target = observer.targets.get(entry.target);
        if (target) {
          target.entrySubject.next(entry);
        }
      }
    }
  }

  private normalize(input?: VpoObserveConfig & Partial<NormalizedCfg>): NormalizedCfg {
    const root = input?.root ?? null;
    const extraMargins: VpoObserveRootMargins = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...input?.extraMargins,
    };
    const config: Required<VpoObserveConfig> = {
      root,
      extraMargins,
      threshold: input?.threshold ?? [1],
      debug: input?.debug ?? false,
      precision: input?.precision ?? 0,
      visibleClass: input?.visibleClass ?? null,
      intersectRatioRootVar: input?.intersectRatioRootVar ?? null,
      visibilityMinRatio: input?.visibilityMinRatio ?? 1,
    };
    const hash = this.getConfigHash(config);
    if (input?.rootMargin) {
      input.rootMargin.viewPort = this.rootMarginFactory.viewPort(config.root);
      input.rootMargin.extraMargins = config.extraMargins;
    }
    return {
      ...config,
      hash,
      rootMargin: input?.rootMargin ?? this.rootMarginFactory.create(root, extraMargins),
      key: input?.key ?? this.createUniqueKey({ ...config, hash }),
    };
  }

  private fastMd5HashObject(object: unknown): string {
    return Md5.hashStr(JsonHelper.stringify(object));
  }

  private getConfigHash(config: Required<VpoObserveConfig>): string {
    return this.fastMd5HashObject({ ...config, root: this.hashableRootElement(config.root) });
  }

  private createUniqueKey(config: Required<VpoObserveConfig> & { hash: string }): string {
    if (this.configKeyMap.has(config.hash)) {
      return this.configKeyMap.get(config.hash) as string;
    }
    const key = this.fastMd5HashObject({
      ...config,
      root: this.hashableRootElement(config.root),
      now: performance.now(),
    });
    this.configKeyMap.set(config.hash, key);
    return key;
  }

  private hashableRootElement(element?: Element | Document | null) {
    const vpiId = (element as HTMLElement)?.dataset['vpoId'] ?? null;
    if (null !== element && null === vpiId) {
      this.logger.error(
        'IoService',
        'hashableRootElement',
        'HTML attribute data-vpo-id="somestring" is missing on root element.'
      );
    }
    return vpiId;
  }
}
