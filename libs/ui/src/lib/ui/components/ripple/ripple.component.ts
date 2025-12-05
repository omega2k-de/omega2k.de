import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { isTrue, MixedBooleanType, WINDOW } from '@o2k/core';

@UntilDestroy()
@Component({
  selector: `ui-ripple, [ui-ripple]`,
  imports: [],
  template: ` <ng-content></ng-content>`,
  styleUrl: './ripple.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleComponent implements OnDestroy {
  private renderer: Renderer2 = inject(Renderer2);
  private removeTimeout: number | null = null;
  private readonly window?: Window = inject(WINDOW);
  private readonly pointerDownHandler = this.handleClick.bind(this);
  disabled = input<MixedBooleanType>(false);
  readonly element: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private readonly onRippleDisabledChanged = effect(() => {
    if (isTrue(this.disabled())) {
      this.element.nativeElement.classList.add('disabled');
      this.removeListenerAndTimeout();
    } else {
      this.element.nativeElement.classList.remove('disabled');
      this.element.nativeElement.addEventListener('pointerdown', this.pointerDownHandler, {
        passive: true,
      });
    }
  });
  duration = input<number>(500);
  readonly afterRemove = output<void>();

  ngOnDestroy(): void {
    this.removeListenerAndTimeout();
  }

  private removeListenerAndTimeout(): void {
    this.clearRemoveTimeout();
    this.element.nativeElement.removeEventListener('pointerdown', this.pointerDownHandler);
  }

  private handleClick(event: PointerEvent) {
    const element = event.currentTarget;
    if (element instanceof HTMLElement) {
      this.clearRemoveTimeout();
      this.removeCircle(element);

      const disabled = element.getAttribute('disabled');
      if (disabled === null || disabled === 'false') {
        const circle = this.createCircle(element, event);
        this.renderer.appendChild(element, circle);
        this.removeTimeout =
          this.window?.setTimeout(this.removeCircle.bind(this, element, true), this.duration()) ??
          null;
      }
    }
  }

  private removeCircle(element: HTMLElement, emitEvent = false): void {
    const ripples = element.querySelectorAll('.ripple');
    if (ripples.length) {
      Array.from(ripples).forEach(node => node.remove());
    }
    if (emitEvent) {
      this.afterRemove.emit();
    }
  }

  private createCircle(element: HTMLElement, event: PointerEvent): HTMLElement {
    const boundingBox = element.getBoundingClientRect();
    const circle: HTMLElement = this.renderer.createElement('i');
    const diameter = Math.max(boundingBox.width, boundingBox.height);
    const radius = diameter / 2;

    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (boundingBox.left + radius)}px`;
    circle.style.top = `${event.clientY - (boundingBox.top + radius)}px`;
    circle.classList.add('ripple');
    return circle;
  }

  private clearRemoveTimeout(): void {
    if (this.removeTimeout) {
      this.window?.clearTimeout(this.removeTimeout);
      this.removeTimeout = null;
    }
  }
}
