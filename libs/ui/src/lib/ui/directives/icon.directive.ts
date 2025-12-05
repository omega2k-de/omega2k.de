import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  Renderer2,
} from '@angular/core';
import { UiIconSizeType, UiIconType } from '@o2k/core';

@Directive({
  selector: '[uiIcon]',
})
export class IconDirective {
  private renderer2 = inject(Renderer2);
  private elementRef = inject(ElementRef<HTMLElement>);

  readonly uiIcon: InputSignal<UiIconType | null> = input.required<UiIconType | null>();
  readonly size: InputSignal<UiIconSizeType> = input<UiIconSizeType>();

  constructor() {
    effect(() => {
      const size = this.size();
      if (size && size !== 'default') {
        this.setAttribute('size', size);
      } else {
        this.removeAttribute('size');
      }
    });
    effect(() => {
      const uiIcon = this.uiIcon();
      if (uiIcon) {
        this.setAttribute('uiIcon', uiIcon);
      } else {
        this.removeAttribute('uiIcon');
      }
    });
  }

  private setAttribute(name: string, size: string) {
    this.renderer2.setAttribute(this.elementRef.nativeElement, name, size);
  }

  private removeAttribute(name: string) {
    this.renderer2.removeAttribute(this.elementRef.nativeElement, name);
  }
}
