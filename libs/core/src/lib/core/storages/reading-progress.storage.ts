import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, groupBy, map, mergeMap } from 'rxjs/operators';
import { LocalStorageService, PlatformService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class ReadingProgressStorage {
  private readonly storageKey = 'readingProgress';
  private readonly debounceMs = 1500;

  private readonly platform = inject(PlatformService);
  private readonly storage = inject(LocalStorageService);

  private progressMap = new Map<number, number>();

  private readonly updateQueueSubject = new Subject<{ key: number; progress: number }>();
  private readonly progressSubject = new BehaviorSubject<Map<number, number>>(this.progressMap);
  readonly progress$: Observable<Map<number, number>> = this.progressSubject.asObservable();

  constructor() {
    if (!this.platform.isBrowser) {
      return;
    }

    this.restoreMap();
    this.setupUpdatePipeline();
  }

  private setupUpdatePipeline(): void {
    this.updateQueueSubject
      .pipe(
        filter(() => this.platform.isBrowser),
        groupBy(e => e.key),
        mergeMap(group$ =>
          group$.pipe(
            debounceTime(this.debounceMs),
            map(e => ({ key: group$.key, progress: e.progress }))
          )
        )
      )
      .subscribe(({ key, progress }) => {
        const current = this.progressMap.get(key) ?? 0;
        if (progress <= current) {
          return;
        }
        const nextMap = new Map(this.progressMap);
        nextMap.set(key, progress);
        this.progressMap = nextMap;
        this.progressSubject.next(this.progressMap);
        this.backupMap();
      });
  }

  restoreMap(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    const data = this.storage.get(this.storageKey);
    if (!data) {
      return;
    }
    try {
      const entries = JSON.parse(data) as [number, number][] | null;
      if (Array.isArray(entries)) {
        this.progressMap = new Map(entries);
        this.progressSubject.next(this.progressMap);
      }
    } catch {
      // ignore
    }
  }

  setProgress(key: number, progress: number): void {
    if (!this.platform.isBrowser) {
      return;
    }
    const clamped = this.clamp(progress);
    this.updateQueueSubject.next({ key, progress: clamped });
  }

  resetAllProgressImmediate(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    const nextMap = new Map(this.progressMap);
    nextMap.clear();
    this.progressMap = nextMap;
    this.progressSubject.next(this.progressMap);
    this.backupMap();
  }

  private clamp(progress: number) {
    return Math.floor(Math.max(0, Math.min(100, progress)));
  }

  setProgressImmediate(key: number, progress: number): void {
    if (!this.platform.isBrowser) {
      return;
    }
    const clamped = this.clamp(progress);
    const current = this.progressMap.get(key) ?? 0;
    if (clamped <= current) {
      return;
    }
    const nextMap = new Map(this.progressMap);
    nextMap.set(key, clamped);
    this.progressMap = nextMap;
    this.progressSubject.next(this.progressMap);
    this.backupMap();
  }

  resetProgressImmediate(key: number): void {
    if (!this.platform.isBrowser) {
      return;
    }
    const nextMap = new Map(this.progressMap);
    nextMap.delete(key);
    this.progressMap = nextMap;
    this.progressSubject.next(this.progressMap);
    this.backupMap();
  }

  progressForKey$(key: number): Observable<number> {
    return this.progress$.pipe(
      map(map => map.get(key) ?? 0),
      distinctUntilChanged()
    );
  }

  private backupMap(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    const entries = Array.from(this.progressMap.entries());
    this.storage.save(this.storageKey, JSON.stringify(entries));
  }
}
