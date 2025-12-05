import {
  AfterViewInit,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnDestroy,
  output,
  Renderer2,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WINDOW } from '@o2k/core';
import { ObserverHandleInterface, VpoObserveConfig } from '../interfaces';
import { IoService } from '../services';

@UntilDestroy()
@Directive({
  selector: '[uiVpoObserve]',
})
export class VpoObserveDirective implements AfterViewInit, OnDestroy {
  private ioEntry = signal<IntersectionObserverEntry | null>(null);
  private visible = signal<boolean>(true);
  private handle: ObserverHandleInterface | null = null;
  private window = inject(WINDOW);
  private injector = inject(Injector);
  private renderer2 = inject(Renderer2);
  private elementRef = inject(ElementRef<HTMLElement>);
  private ioService = inject(IoService);
  private lastRatioRootVar = '';
  private lastVisible = false;
  config: InputSignal<VpoObserveConfig | undefined> = input<VpoObserveConfig>(undefined, {
    alias: 'uiVpoObserve',
  });
  private visibilityMinRatio = computed(() => this.config()?.visibilityMinRatio ?? 1);
  readonly vpoEntry = output<IntersectionObserverEntry>();
  readonly vpoVisibleChange = output<boolean>();

  ngAfterViewInit() {
    this.window?.requestAnimationFrame(() =>
      runInInjectionContext(this.injector, () => this.injectEffects())
    );
  }

  ngOnDestroy(): void {
    if (this.handle) {
      this.handle.unobserve();
      this.handle = null;
    }
  }

  private injectEffects() {
    effect(
      () => {
        const config = this.config();
        if (config) {
          if (!this.handle) {
            this.handle = this.ioService.observe(this.elementRef.nativeElement, config);
            this.handle.entries$
              .pipe(untilDestroyed(this))
              .subscribe(entry => this.handleEntry(entry));
          } else {
            this.handle.update(config);
          }
        }
      },
      {
        debugName: 'vpo.observe.updateConfig',
      }
    );

    effect(
      () => {
        const visibleClass = this.config()?.visibleClass;
        if (typeof visibleClass === 'string' && visibleClass.length) {
          this.toggleClass(visibleClass, this.visible());
        }
      },
      {
        debugName: 'vpo.visible.classList',
      }
    );

    effect(
      () => {
        const intersectRatioRootVar = this.config()?.intersectRatioRootVar;
        const entry = this.ioEntry();
        if (entry && typeof intersectRatioRootVar === 'string' && intersectRatioRootVar.length) {
          this.window?.requestAnimationFrame(() =>
            this.updateRootVar(intersectRatioRootVar, entry)
          );
        }
      },
      {
        debugName: 'vpo.intersectionRatio.rootVar',
      }
    );

    effect(
      () => {
        const entry = this.ioEntry();
        this.emitVisibility(
          entry?.isIntersecting === true && entry.intersectionRatio >= this.visibilityMinRatio()
        );
      },
      {
        debugName: 'vpo.intersectionRatio.rootVar',
      }
    );
  }

  private handleEntry(entry: IntersectionObserverEntry): void {
    this.vpoEntry.emit(entry);
    this.ioEntry.set(entry);
  }

  private emitVisibility(visible: boolean) {
    if (this.lastVisible !== visible) {
      this.lastVisible = visible;
      this.vpoVisibleChange.emit(visible);
      this.visible.set(visible);
    }
  }

  private toggleClass(visibleClass: string, visible: boolean) {
    this.renderer2[visible ? 'addClass' : 'removeClass'](
      this.elementRef.nativeElement,
      visibleClass
    );
  }

  private updateRootVar(intersectRatioRootVar: string, entry: IntersectionObserverEntry) {
    const ratio = (entry.isIntersecting ? entry.intersectionRatio : 0).toFixed(3);
    if (this.lastRatioRootVar !== ratio) {
      this.lastRatioRootVar = ratio;
      this.renderer2.setProperty(
        this.elementRef.nativeElement,
        'style',
        `--${intersectRatioRootVar}:${ratio};`
      );
    }
  }
}
