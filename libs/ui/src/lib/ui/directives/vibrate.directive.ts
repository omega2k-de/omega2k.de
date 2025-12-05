import {
  computed,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  Signal,
} from '@angular/core';
import { isTrue, MixedBooleanType, WINDOW } from '@o2k/core';

@Directive({
  selector: '[uiVibrate]',
})
export class VibrateDirective {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private readonly window?: Window = inject(WINDOW);
  uiVibrate = input<VibratePattern | ''>([5, 5]);
  private pattern: Signal<VibratePattern> = computed(() => {
    const vibrate = this.uiVibrate();
    return vibrate === '' ? [30, 30] : vibrate;
  });
  disabled = input<MixedBooleanType>(false);
  blur = input<MixedBooleanType>(false);

  @HostListener('pointerup')
  vibrate() {
    if (!isTrue(this.disabled()) && this.window?.navigator && 'vibrate' in this.window.navigator) {
      this.window.navigator.vibrate(0);
      this.window.navigator.vibrate(this.pattern());
      if (isTrue(this.blur())) {
        this.elementRef.nativeElement.blur();
      }
    }
    return true;
  }
}
