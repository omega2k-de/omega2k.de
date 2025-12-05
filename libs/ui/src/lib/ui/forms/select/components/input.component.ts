import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  output,
  Renderer2,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LoggerService, WINDOW } from '@o2k/core';
import { combineLatest, distinctUntilChanged, map, Observable, throttleTime } from 'rxjs';
import { SelectObject } from '..';
import { AutoIdDirective, VibrateDirective } from '../../../directives';
import { ConfigService, FocusService, ItemsService, SelectionService } from '../services';

@UntilDestroy()
@Component({
  selector: 'ui-input',
  imports: [AutoIdDirective, FormsModule, VibrateDirective, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent<T extends SelectObject> {
  private loggerService: LoggerService = inject(LoggerService);
  private itemsS: ItemsService<T> = inject(ItemsService<T>, { self: false });
  private selectionS: SelectionService<T> = inject(SelectionService<T>, { self: false });
  protected readonly window?: Window = inject(WINDOW);
  protected renderer2: Renderer2 = inject(Renderer2);
  protected configS: ConfigService<T> = inject(ConfigService<T>, { self: false });
  protected textInput: FormControl<string> = new FormControl<string>('', { nonNullable: true });
  protected focusS: FocusService<T> = inject(FocusService<T>, { self: false });
  protected inputTabindex: Signal<string> = computed(() =>
    this.focusS.isFocusTrapDisabled() ? '-1' : '0'
  );
  @ViewChild('labelElement') labelElement?: ElementRef<HTMLLabelElement>;
  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;
  readonly touched = output();
  readonly inputValueChanges$: Observable<string> = this.textInput.valueChanges.pipe(
    throttleTime(1000 / 60, undefined, { leading: true, trailing: true }),
    untilDestroyed(this)
  );

  constructor() {
    effect(() => this.textInput[this.configS.disabled() ? 'disable' : 'enable']());
    this.setSearchStringFromInput();
    this.resetInputOnSelectionChanged();
  }

  get value(): string {
    return this.textInput.value;
  }

  patchValue(value: string, options?: { emitEvent?: boolean; onlySelf?: boolean }) {
    if (this.inputElement?.nativeElement.hasAttribute('value')) {
      this.renderer2.removeAttribute(this.inputElement.nativeElement, 'value');
    }
    this.textInput.patchValue(value, options);
  }

  clear() {
    this.patchValue('', { emitEvent: false, onlySelf: true });
    this.selectionS.clear();
  }

  focus() {
    const input = this.inputElement?.nativeElement;
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      input.scrollLeft = input.scrollWidth;
      this.focusS.focus = 'input';
    }
  }

  onSelect(event: Event) {
    this.loggerService.warn('InputComponent', 'handleSelection', event);
  }

  private resetInputOnSelectionChanged(): void {
    this.selectionS.changes$
      .pipe(
        distinctUntilChanged((a, b) => a?.hash === b?.hash),
        map(changes => ({
          value: changes?.text ?? '',
          emitEvent: changes?.emit ?? false,
        })),
        distinctUntilChanged((a, b) => a.value === b.value),
        untilDestroyed(this)
      )
      .subscribe(data =>
        this.textInput.patchValue(data.value, { emitEvent: data.emitEvent, onlySelf: true })
      );
  }

  private setSearchStringFromInput() {
    combineLatest([this.inputValueChanges$, this.selectionS.changes$])
      .pipe(
        distinctUntilChanged((a, b) => a[0] === b[0]),
        map(([inputValue, selectionChanges]) =>
          null !== selectionChanges && this.configS.isMultiple()
            ? inputValue.replace(selectionChanges.text, '')
            : inputValue
        ),
        map(search => (this.configS.mode() === 'select' ? '' : search)),
        distinctUntilChanged((a, b) => a === b),
        untilDestroyed(this)
      )
      .subscribe(search => this.itemsS.setSearchString(search));
  }
}
