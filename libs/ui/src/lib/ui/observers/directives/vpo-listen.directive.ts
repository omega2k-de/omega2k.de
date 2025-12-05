import {
  AfterViewInit,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  output,
  Renderer2,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WINDOW } from '@o2k/core';
import { NormalizedCfg, ObserverHandleInterface } from '../interfaces';
import { IoService } from '../services';

@UntilDestroy()
@Directive({
  selector: '[uiVpoListen]',
})
export class VpoListenDirective implements AfterViewInit, OnDestroy {
  private ioEntry = signal<IntersectionObserverEntry | null>(null);
  private visible = signal<boolean>(true);
  private config = signal<NormalizedCfg | null>(null);
  private handle: ObserverHandleInterface | null = null;
  private window = inject(WINDOW);
  private injector = inject(Injector);
  private renderer2 = inject(Renderer2);
  private elementRef = inject(ElementRef<HTMLElement>);
  private ioService = inject(IoService);
  private lastVisible = true;
  private lastRatioRootVar = '';
  private visibilityMinRatio = computed(() => this.config()?.visibilityMinRatio ?? 1);
  key = input.required<string>({ alias: 'uiVpoListen' });
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
        const key = this.key();
        if (key && key.length && !this.handle) {
          this.handle = this.ioService.listen(this.elementRef.nativeElement, key);
          this.config.set(this.handle.config);
          this.handle.config$
            .pipe(untilDestroyed(this))
            .subscribe(config => this.config.set(config));
          this.handle.entries$
            .pipe(untilDestroyed(this))
            .subscribe(entry => this.handleEntries(entry));
        }
      },
      {
        debugName: 'vpo.init.listener',
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

  private handleEntries(entry: IntersectionObserverEntry): void {
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
