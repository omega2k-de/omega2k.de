import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';
import { isTrue, MixedBooleanType } from '@o2k/core';

@Component({
  selector: 'ui-focus-trap',
  template: '',
})
export class FocusTrapComponent {
  private element = inject(ElementRef);
  private renderer2 = inject(Renderer2);
  disabled = input<MixedBooleanType>(true);
  isDisabled = computed(() => isTrue(this.disabled()));
  target = input<HTMLElement>();
  trapFocus = output<FocusEvent>();

  constructor() {
    effect(() => {
      if (this.isDisabled()) {
        this.disable();
      } else {
        this.enable();
      }
    });
  }

  enable() {
    this.setTabIndex('0');
  }

  disable() {
    this.setTabIndex('-1');
  }

  @HostListener('focus', ['$event'])
  onFocus(e: FocusEvent) {
    if (!this.isDisabled()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.target()?.focus();
      this.trapFocus.emit(e);
    }
  }

  private setTabIndex(tabindex: string) {
    this.renderer2.setAttribute(this.element.nativeElement, 'tabindex', tabindex);
  }
}
