import { coerceArray } from '@angular/cdk/coercion';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JsonHelper, LoggerService, WINDOW } from '@o2k/core';
import { distinctUntilChanged, noop } from 'rxjs';
import {
  BadgeActionsComponent,
  ConfigService,
  Cursor,
  EntropyDropdownComponent,
  FocusElement,
  FocusService,
  InputComponent,
  ItemsService,
  ListDropdownComponent,
  SelectComponentOptions,
  SelectionCursor,
  SelectionService,
  SelectObject,
  UiSelectFormValue,
} from '.';
import { FocusTrapComponent } from '../../components';
import { ScrollIntoViewDirective } from '../../directives';

@UntilDestroy()
@Component({
  selector: 'ui-select',
  imports: [
    ReactiveFormsModule,
    ScrollingModule,
    FocusTrapComponent,
    BadgeActionsComponent,
    InputComponent,
    EntropyDropdownComponent,
    ListDropdownComponent,
    ListDropdownComponent,
    ScrollIntoViewDirective,
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    ItemsService,
    ConfigService,
    FocusService,
    SelectionService,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
  ],
})
export class SelectComponent<T extends SelectObject> implements ControlValueAccessor {
  private openStates: (FocusElement | null)[] = ['input', 'label', 'list', 'option'];
  private _onChange: (value: UiSelectFormValue<T>) => void = noop;
  private _onTouched: () => void = noop;
  protected configS: ConfigService<T> = inject(ConfigService<T>);
  protected itemsS: ItemsService<T> = inject(ItemsService<T>);
  protected selectionS: SelectionService<T> = inject(SelectionService<T>);
  protected focusS: FocusService<T> = inject(FocusService<T>);
  protected logger: LoggerService = inject(LoggerService);
  protected readonly window?: Window = inject(WINDOW);
  protected elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  protected cursor = toSignal(this.itemsS.cursor$, { requireSync: true });
  protected searchString = toSignal(this.itemsS.searchString$, { requireSync: true });
  protected isDropdownOpen = computed(
    () => this.openStates.includes(this.focusS.focusElement()) || this.configS.open() !== false
  );
  @ViewChild('input') inputRef!: InputComponent<T>;
  @ViewChild('wrapper') wrapperRef!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.elementRef.nativeElement.classList.remove('select', 'input');
      const mode = this.configS.mode();
      const className = mode === 'select' ? 'select' : 'input';
      this.elementRef.nativeElement.classList.add(className);
    });

    effect(() => {
      const method = this.configS.disabled() ? 'add' : 'remove';
      this.elementRef.nativeElement.classList[method]('disabled');
    });

    this.selectionS.changes$
      .pipe(
        distinctUntilChanged((a, b) => a?.hash === b?.hash),
        untilDestroyed(this)
      )
      .subscribe(changes => {
        if (changes?.emit) {
          const mode = this.configS.mode();
          const value = mode === 'input' ? changes.text : changes.value;
          this.logger.info(
            this.loggerContext,
            `emit ${mode} changes`,
            changes,
            JsonHelper.stringify({ value })
          );
          this.callOnChange(value);
        }
      });
  }

  get loggerContext(): string {
    return `SelectComponent:${this.configS.name()}`;
  }

  @Input({ required: true })
  set formControlName(name: string) {
    this.configS.setControlName(name);
  }

  @Input()
  set options(options: SelectComponentOptions<T>) {
    this.configS.setOptions(options);
  }

  @Input()
  set items(items: T[]) {
    this.itemsS.setAllItems(items);
  }

  registerOnChange(fn: (value: UiSelectFormValue<T>) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.configS.setDisabled(isDisabled);
  }

  writeValue(value: UiSelectFormValue<T>): void {
    this.logger.debug(this.loggerContext, 'writeValue', { value });
    if (value === null) {
      this.selectionS.clear();
    } else {
      const options =
        typeof value === 'string'
          ? this.itemsS.findInAllByLabelStrict(value, true)
          : this.itemsS.findInAllByValues(coerceArray(value));
      this.selectionS.clear({ emitEvent: false });
      this.selectionS.select(options, { emitViewToModelChange: false });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    const { code, keyCode, which } = e;
    const numCode = keyCode ?? which ?? -1;

    switch (true) {
      // browser autofill
      case code === undefined && numCode === -1:
        this.handleBrowserAutofill(e);
        return;
      case 'Escape' === code:
      case 27 === numCode:
        this.handleEscapeKey(e);
        return;
      case 'Home' === code:
      case 'End' === code:
      case 36 === numCode: // Home
      case 35 === numCode: // End
        return;
      case 'ArrowDown' === code:
      case 'ArrowUp' === code:
      case 'PageDown' === code:
      case 'PageUp' === code:
      case 40 === numCode: // ArrowDown
      case 38 === numCode: // ArrowUp
      case 34 === numCode: // PageDown
      case 33 === numCode: // PageUp
        e.preventDefault();
        this.handleArrows(code, numCode);
        return;
      case 'Enter' === code:
      case 13 === numCode:
        e.preventDefault();
        this.handleEnter(e);
        return;
      case 'Tab' === code:
      case 9 === numCode:
        return;
      case 'Backspace' === code:
      case 8 === numCode: // Backspace
        this.handleBackspace();
        return;
      case 'ArrowLeft' === code:
      case 'ArrowRight' === code:
      case 'Delete' === code:
      case 37 === numCode: // ArrowLeft
      case 39 === numCode: // ArrowRight
      case 46 === numCode: // Delete
        // this.handleSelection(e, this.numCodeToKeyCode(numCode));
        return;
    }

    this.logger.warn(this.loggerContext, 'onKeyDown unhandled', { code, numCode });
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    const related = this.getRelatedFocusOutside(event);
    const focus = this.getFocus(event);
    this.logger.info(this.loggerContext, 'onFocus:focusin', { related, focus });
    if (related === 'input') {
      this.inputRef.focus();
    } else {
      this.focusS.focus = focus;
    }
  }

  @HostListener('focusout', ['$event'])
  onBlur(event: FocusEvent) {
    const didLeave =
      event.relatedTarget === null ||
      (event.relatedTarget instanceof HTMLElement &&
        !this.elementRef.nativeElement.contains(event.relatedTarget));
    this.logger.info(this.loggerContext, 'onBlur:focusout', { didLeave });
    if (didLeave) {
      this.tryToSelectOnlyOption();
      this.fixInputValue();
      this.focusS.focus = null;
    }
  }

  badgePressed(action: 'clear') {
    switch (action) {
      case 'clear':
        this.inputRef.clear();
        this.inputRef.focus();
    }
  }

  protected callOnChange(value: UiSelectFormValue<T>): void {
    if (typeof this._onChange === 'function') {
      this.logger.debug(this.loggerContext, '_onChange', { value });
      this._onChange(value);
    }
  }

  protected callOnTouched(): void {
    if (typeof this._onTouched === 'function') {
      this.logger.debug(this.loggerContext, '_onTouched');
      this._onTouched();
      if (!this.configS.isMultiple()) {
        this.handleEscapeKey();
      }
    }
  }

  private handleBackspace() {
    if (this.inputRef.value.length <= 1) {
      this.itemsS.current = null;
      this.selectionS.clear();
    }
  }

  private getRelatedFocusOutside(event: FocusEvent): FocusElement | null {
    const { relatedTarget } = event;
    if (
      relatedTarget instanceof HTMLElement &&
      !this.elementRef.nativeElement.contains(relatedTarget)
    ) {
      return (relatedTarget.dataset['focus'] as FocusElement) ?? null;
    }
    return null;
  }

  private handleEscapeKey(e?: KeyboardEvent) {
    if (this.focusS.focusElement() !== 'select') {
      this.logger.debug(this.loggerContext, 'handleEscapeKey and focus wrapper');
      e?.preventDefault();
      this.wrapperRef.nativeElement.focus();
    }
  }

  private handleBrowserAutofill(e: KeyboardEvent) {
    this.window?.requestAnimationFrame(() => {
      if (e.target instanceof HTMLInputElement && e.target.value.length > 0) {
        this.createAndSelectOptionIfPossible(e.target.value);
        if (this.selectionS.hasSelection) {
          this.handleEscapeKey();
        }
      }
    });
  }

  private createAndSelectOptionIfPossible(label: string) {
    const option = this.itemsS.findInAllByLabelStrict(label, true);
    this.logger.debug(this.loggerContext, 'createAndSelectOptionIfPossible', { label, option });
    this.selectionS.select(option);
  }

  private handleEnter(e?: KeyboardEvent) {
    const mode = this.configS.mode();
    const element = this.focusS.focusElement();
    this.logger.debug(this.loggerContext, 'handleEnter', { e, element, mode });
    switch (element) {
      case 'badge':
      case 'select':
        this.inputRef.focus();
        break;
      case 'input':
      case 'list':
        e?.preventDefault();
        this.window?.requestAnimationFrame(() => {
          const cursor = this.itemsS.cursor;
          if (cursor.curr) {
            if (this.configS.isMultiple() || !this.selectionS.isSelected(cursor.curr)) {
              this.selectionS.toggle(cursor.curr);
            } else {
              this.fixInputValue();
            }
            this.callOnTouched();
          } else if (
            null !== cursor.prev &&
            null !== cursor.next &&
            cursor.prev.hash === cursor.next.hash
          ) {
            this.itemsS.current = cursor.next;
          } else {
            this.logger.warn(this.loggerContext, 'handleEnter', { e, element, mode, cursor });
          }
        });
        break;
    }
  }

  private fixInputValue() {
    const value = this.selectionS.toString();
    this.logger.debug(this.loggerContext, 'fixInputValue', { value });
    this.inputRef.patchValue(value);
  }

  private handleArrows(code: string, numCode: number) {
    const cursor: Cursor<T> = this.cursor();
    let next: SelectionCursor<T> = null;
    switch (true) {
      // case 'Home' === code:
      // case 36 === numCode: // ArrowDown
      //   next = cursor.first;
      //   break;
      // case 'End' === code:
      // case 35 === numCode: // ArrowDown
      //   next = cursor.last;
      //   break;
      case 'ArrowDown' === code:
      case 40 === numCode: // ArrowDown
        next = cursor.next;
        break;
      case 'ArrowUp' === code:
      case 38 === numCode: // ArrowUp
        next = cursor.prev;
        break;
      case 'PageDown' === code:
      case 34 === numCode: // PageDown
        next = cursor.nextPage;
        break;
      case 'PageUp' === code:
      case 33 === numCode: // PageUp
        next = cursor.prevPage;
        break;
    }

    if (this.focusS.focusElement() === 'select') {
      this.logger.debug(this.loggerContext, 'handleArrows select', { next });
      this.selectionS.select(next);
    }

    this.logger.debug(this.loggerContext, 'handleArrows dropdown', { next });
    this.itemsS.current = next;
  }

  private tryToSelectOnlyOption() {
    const cursor = this.cursor();
    const canSelectOne = cursor.last === cursor.first && null !== cursor.curr;
    this.logger.info(this.loggerContext, 'tryToSelectOnlyOption', {
      select: cursor.curr,
      canSelectOne,
    });
    if (canSelectOne) {
      this.selectionS.select(cursor.curr);
    }
  }

  private getFocus(event: FocusEvent): FocusElement | null {
    const { target } = event;
    if (target === this.wrapperRef.nativeElement) {
      return 'select';
    } else if (
      target instanceof HTMLLabelElement ||
      (target instanceof HTMLDivElement && target.classList.contains('trap'))
    ) {
      return 'label';
    } else if (target instanceof HTMLElement) {
      const focus = target.dataset['focus'] as FocusElement | undefined;
      if (focus && ['badge', 'input', 'label', 'select', 'list', 'option'].includes(focus)) {
        return focus as FocusElement;
      }
    }
    this.logger.warn(this.loggerContext, 'getFocus unhandled target', {
      event,
    });
    return null;
  }
}
