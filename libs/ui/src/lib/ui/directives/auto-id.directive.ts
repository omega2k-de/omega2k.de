import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { ObjectHelper } from '@o2k/core';

export type IAutoIdElements =
  | HTMLInputElement
  | HTMLButtonElement
  | HTMLOutputElement
  | HTMLMeterElement
  | HTMLProgressElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

@Directive({
  selector: 'label[uiAutoId]',
})
export class AutoIdDirective {
  private element = inject(ElementRef<HTMLLabelElement>);
  private renderer = inject(Renderer2);
  uiAutoId = input.required<IAutoIdElements>();
  length = input<number>(8);
  readonly id = ObjectHelper.randomId();
  private _onUpdate = effect(() => {
    this.renderer.setProperty(this.uiAutoId(), 'id', this.id.substring(0, this.length()));
    this.renderer.setProperty(
      this.element.nativeElement,
      'htmlFor',
      this.id.substring(0, this.length())
    );
  });
}
