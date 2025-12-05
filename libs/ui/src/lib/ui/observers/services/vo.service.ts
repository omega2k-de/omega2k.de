import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { LoggerService, WINDOW } from '@o2k/core';
import { map, Observable, Subject, throttleTime } from 'rxjs';
import { ViewportRootElement } from '../interfaces/config.interface';

type EventListenerKeys = VisualViewport | ViewportRootElement | Window;

@Injectable({
  providedIn: 'root',
})
export class VoService {
  private readonly tickSubject = new Subject<number>();
  private readonly listenerRef = new Map<EventListenerKeys, number>();

  private readonly window?: Window = inject(WINDOW);
  private readonly logger: LoggerService = inject(LoggerService);
  private readonly zone: NgZone = inject(NgZone);
  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  readonly tick$: Observable<number> = this.tickSubject.asObservable().pipe(
    throttleTime(1000 / 60, undefined, { leading: false, trailing: true }),
    map(() => performance.now())
  );

  unobserve(root: ViewportRootElement): void {
    const window = this.window;
    if (!this.isBrowser || !window) {
      this.logger.warn('VoService', 'unobserve', 'SSR');
      return;
    }
    this.windowListeners('remove');
    this.visualViewportListeners('remove');
    this.rootListeners(root, 'remove');
  }

  observe(root: ViewportRootElement): void {
    const window = this.window;
    if (!this.isBrowser || !window) {
      this.logger.warn('VoService', 'observe', 'SSR');
      return;
    }
    this.windowListeners('add');
    this.visualViewportListeners('add');
    this.rootListeners(root, 'add');

    this.tick();
  }

  private visualViewportListeners(action: 'add' | 'remove'): void {
    const viewport = this.window?.visualViewport;
    if (viewport) {
      if (this.needToModifyListeners(viewport, action)) {
        const method = this.getMethod(action);
        this.zone.runOutsideAngular(() => {
          viewport[method]('resize', this.tick);
          viewport[method]('scroll', this.tick);
        });
      }
      this.updateRefCount(viewport, action);
    }
  }

  private rootListeners(root: ViewportRootElement, action: 'add' | 'remove'): void {
    if (root) {
      if (this.needToModifyListeners(root, action)) {
        const method = this.getMethod(action);
        this.zone.runOutsideAngular(() => {
          root[method]('resize', this.tick);
          root[method]('scroll', this.tick);
        });
      }
      this.updateRefCount(root, action);
    }
  }

  private windowListeners(action: 'add' | 'remove'): void {
    const window = this.window;
    if (window) {
      if (this.needToModifyListeners(window, action)) {
        const method = this.getMethod(action);
        this.zone.runOutsideAngular(() => {
          window[method]('resize', this.tick);
          window[method]('scroll', this.tick);
          window[method]('orientationchange', this.tick);
        });
      }
      this.updateRefCount(window, action);
    }
  }

  private readonly tick = () => this.tickSubject.next(performance.now());

  private getMethod(action: 'add' | 'remove') {
    return action === 'add' ? 'addEventListener' : 'removeEventListener';
  }

  private needToModifyListeners(root: EventListenerKeys, action: 'add' | 'remove'): boolean {
    return (
      (action === 'add' && !this.listenerRef.has(root)) ||
      (action === 'remove' && this.listenerRef.get(root) === 1)
    );
  }

  private updateRefCount(root: EventListenerKeys, action: 'add' | 'remove') {
    let refCount = this.listenerRef.get(root) ?? 0;
    if (action === 'remove' && refCount > 0) {
      refCount--;
    } else if (action === 'add') {
      refCount++;
    }
    if (refCount > 0) {
      this.listenerRef.set(root, refCount);
    } else if (this.listenerRef.has(root)) {
      this.listenerRef.delete(root);
    }
  }
}
