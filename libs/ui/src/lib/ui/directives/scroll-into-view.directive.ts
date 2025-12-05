import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { LoggerService, PlatformService, WINDOW } from '@o2k/core';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[uiScrollIntoView]',
})
export class ScrollIntoViewDirective implements AfterViewInit, OnDestroy {
  protected window = inject(WINDOW);
  protected loggerS = inject(LoggerService);
  protected elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  protected platformS: PlatformService = inject(PlatformService);
  protected renderer: Renderer2 = inject(Renderer2);
  protected selfElement: HTMLElement | null = null;
  protected eventListener?: (event?: PointerEvent) => void;
  marginTop = input<string | number>();

  ngAfterViewInit(): void {
    if (this.platformS.isBrowser) {
      this.createElement();
      this.addEventHandler();
      this.enable();
      this.selfElement?.remove();
      this.renderer.appendChild(this.elementRef.nativeElement, this.selfElement);
    }
  }

  enable() {
    if (this.selfElement) {
      this.selfElement.style.pointerEvents = 'visible';
      this.renderer.setAttribute(this.selfElement, 'tabindex', '0');
    }
  }

  disable() {
    if (this.selfElement) {
      this.selfElement.style.pointerEvents = 'none';
      this.renderer.setAttribute(this.selfElement, 'tabindex', '-1');
    }
  }

  ngOnDestroy(): void {
    if (this.selfElement) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.selfElement);
      this.selfElement = null;
    }
  }

  onClick(event?: PointerEvent): void {
    this.loggerS.log('ScrollIntoViewDirective', 'onClick', { event });
    const window = this.window;
    const element = this.elementRef.nativeElement;
    if (element instanceof HTMLElement && window && 'scrollTop' in window) {
      const bounds = element.getBoundingClientRect();
      // const availHeight = window.screen.availHeight;
      // const viewport = window.visualViewport;
      const left = 0;
      const top = bounds.top + window.scrollY - parseFloat(`${this.marginTop() ?? 0}`);
      const options: ScrollToOptions = { top, left, behavior: 'smooth' };
      this.disable();

      const stop = new Subject<void>();
      fromEvent(window, 'scroll')
        .pipe(debounceTime(50), takeUntil(stop))
        .subscribe(() => {
          stop.next();
          stop.complete();
          element.querySelector('input')?.focus();
        });
      window.scrollTo(options);
    }
  }

  private createElement() {
    if (!this.selfElement) {
      this.selfElement = this.renderer.createElement('b') as HTMLElement;
      this.renderer.setAttribute(this.selfElement, 'tabindex', '-1');
      this.renderer.setAttribute(this.selfElement, 'data-scroll-into-view', '');
      this.renderer.setStyle(this.selfElement, 'position', 'absolute');
      this.renderer.setStyle(this.selfElement, 'inset', '3px');
      this.renderer.setStyle(this.selfElement, 'zIndex', '1');
      this.renderer.setStyle(this.selfElement, 'cursor', 'pointer');
      this.renderer.setStyle(this.selfElement, 'pointerEvents', 'none');
      this.renderer.setStyle(this.selfElement, 'borderRadius', 'inherit');
      this.renderer.setStyle(this.selfElement, 'backgroundColor', 'rgba(0,0,0,0.1)');
    }
  }

  private addEventHandler() {
    if (this.selfElement && !this.eventListener) {
      this.selfElement.addEventListener('focusin', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
      });
      this.eventListener = (event?: PointerEvent) => this.onClick(event);
      this.selfElement.addEventListener('click', this.eventListener, { passive: true });
    }
  }
}
