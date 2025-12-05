import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  Renderer2,
  signal,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WINDOW } from '@o2k/core';
import { IconDirective } from '../../directives';
import {
  ObserverDebugHandleInterface,
  RootMarginInterface,
  RootVarsObjectInterface,
} from '../interfaces';
import { IoService } from '../services';

@UntilDestroy()
@Component({
  selector: 'ui-vpo-debug',
  imports: [IconDirective],
  templateUrl: './vpo-debug.component.html',
  styleUrl: './vpo-debug.component.scss',
})
export class VpoDebugComponent implements OnDestroy {
  private renderer2 = inject(Renderer2);
  private window = inject(WINDOW);
  private element: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private viewportObserverService: IoService = inject(IoService);
  private handle: ObserverDebugHandleInterface | null = null;
  key = input.required<string>();
  bgColor = input<string>();
  color = input<string>();
  opacity = input(0.2, { transform: numberAttribute });
  rootMargin = signal<RootMarginInterface | null>(null);
  enabled = signal<boolean>(false);
  refCount = signal<number>(0);

  constructor() {
    effect(
      () => {
        const key = this.key();
        if (key && key.length && !this.handle) {
          this.handle = this.viewportObserverService.listen<ObserverDebugHandleInterface>(
            this.nativeElement,
            key,
            true
          );
          this.handle.rootMargin$
            .pipe(untilDestroyed(this))
            .subscribe(rootMargin => this.handleViewportUpdate(rootMargin));
          this.handle.poolCount$
            .pipe(untilDestroyed(this))
            .subscribe(count => this.refCount.set(count));
        }
      },
      { debugName: 'vpo.debug.updateConfig' }
    );
  }

  get nativeElement(): HTMLElement {
    return this.element.nativeElement;
  }

  ngOnDestroy(): void {
    this.unobserve();
  }

  protected getPrefixedStyleVars(
    attributes?: RootVarsObjectInterface,
    options?: { prefix?: string; precision?: number; noPx?: (keyof RootVarsObjectInterface)[] }
  ): string {
    if (!attributes) {
      return '';
    }
    return Object.entries(attributes)
      .map(
        ([k, v]: [keyof RootVarsObjectInterface, number]) =>
          `--${options?.prefix ?? 'vpo'}-${k}:${v}${options?.noPx?.includes(k) ? '' : 'px'};`
      )
      .join('');
  }

  protected vibrate() {
    if (this.window?.navigator && 'vibrate' in this.window.navigator) {
      this.window.navigator.vibrate(0);
      this.window.navigator.vibrate([30, 30]);
    }
    return true;
  }

  private unobserve() {
    this.handle?.unobserve();
    this.handle = null;
  }

  private handleViewportUpdate(rootMargin: RootMarginInterface) {
    const viewBox = rootMargin.viewBox;
    const s = 1 / viewBox.scale;
    const x = Math.max(0, viewBox.pageLeft, viewBox.offsetLeft);
    const y = Math.max(0, viewBox.pageTop, viewBox.offsetTop);
    const w = viewBox.width;
    const h = viewBox.height;

    const attributes = { x, y, w, h, s };
    const styles = [
      this.getPrefixedStyleVars(attributes, { noPx: ['s'] }),
      this.getPrefixedStyleVars(rootMargin.margins(1), { prefix: 'vpo-margin' }),
      `--vpo-bg-color:${this.bgColor() ?? 'rgba(255, 0, 0, 0.2)'};`,
      `--vpo-border-color:${this.color() ?? 'rgba(255, 0, 0, 0.8)'};`,
      `--vpo-opacity:${this.opacity() ?? 0.05};`,
    ];
    this.applyStyles(styles);
    this.rootMargin.set(rootMargin);
  }

  private applyStyles(styles: string[]) {
    if (!this.element.nativeElement.hasAttribute('data-active')) {
      this.renderer2.setAttribute(this.element.nativeElement, 'data-active', '');
    }
    this.renderer2.setAttribute(this.element.nativeElement, 'style', styles.join(''));
  }
}
