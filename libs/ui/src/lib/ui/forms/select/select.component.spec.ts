import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideConfig } from '@o2k/core';
import * as mockDate from 'mockdate';
import { afterEach, beforeEach } from 'vitest';
import {
  FocusElement,
  SelectComponent,
  SelectComponentOptions,
  SelectObject,
  UiSelectFormValue,
} from '.';

interface TestSelectObject extends SelectObject {
  value?: null | string | number;
}

interface TestFocusData {
  focus: string;
  expected: FocusElement | null;
  warnCalls: number;
}

interface TestData<T extends TestSelectObject> {
  options: SelectComponentOptions<T>;
  items: T[];
  formControlName: string;
  disabled: boolean;
  writeValue: string | UiSelectFormValue<T>;
  inputValue: string;
  classes: { [key: string]: boolean };
  attributes: { [key: string]: string };
}

describe('SelectComponent', () => {
  let component: SelectComponent<TestSelectObject>;
  let fixture: ComponentFixture<SelectComponent<TestSelectObject>>;

  beforeEach(() => {
    mockDate.set(1752952580109);
  });

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    mockDate.reset();
    vi.resetAllMocks();
  });

  describe('select should fill form', () => {
    const data: TestData<TestSelectObject>[] = [
      {
        options: {},
        items: [],
        formControlName: 'controlName',
        writeValue: 'test',
        inputValue: '',
        disabled: false,
        classes: { input: true },
        attributes: {
          uiVibrate: '',
          spellcheck: 'false',
          tabindex: '0',
          name: 'controlName',
          autocomplete: 'one-time-code',
          placeholder: '',
          type: 'text',
          class: 'ng-untouched ng-pristine ng-valid',
          'data-focus': 'input',
        },
      },
      {
        options: { mode: 'select' },
        items: [],
        formControlName: 'controlName',
        writeValue: 'test',
        inputValue: '',
        disabled: true,
        classes: { select: true, disabled: true },
        attributes: {
          uiVibrate: '',
          spellcheck: 'false',
          tabindex: '-1',
          name: 'controlName',
          autocomplete: 'one-time-code',
          placeholder: '',
          type: 'text',
          inert: '',
          disabled: '',
          class: 'ng-untouched ng-pristine',
          'data-focus': 'input',
        },
      },
      {
        options: { mode: 'auto' },
        items: [],
        formControlName: 'controlName',
        writeValue: 'test',
        inputValue: '',
        disabled: false,
        classes: { input: true },
        attributes: {
          autocomplete: 'one-time-code',
          class: 'ng-untouched ng-pristine ng-valid',
          'data-focus': 'input',
          name: 'controlName',
          placeholder: '',
          spellcheck: 'false',
          tabindex: '0',
          type: 'text',
          uiVibrate: '',
        },
      },
      {
        options: { mode: 'auto', label: 'Some Label' },
        items: [],
        formControlName: 'controlName',
        writeValue: 'test',
        inputValue: '',
        disabled: false,
        classes: { input: true },
        attributes: {
          autocomplete: 'one-time-code',
          class: 'ng-untouched ng-pristine ng-valid',
          'data-focus': 'input',
          name: 'controlName',
          placeholder: 'Some Label',
          spellcheck: 'false',
          tabindex: '0',
          type: 'text',
          uiVibrate: '',
        },
      },
      {
        options: {
          mode: 'auto',
          label: 'Some Label',
          type: 'search',
          autocomplete: 'off',
          multiselect: {
            separator: ', ',
            suffix: ']',
            prefix: '[',
            showCount: false,
          },
          factory: (label: string) => ({ label }),
        },
        items: [
          {
            label: 'Option 1',
          },
          {
            label: 'Option 2',
          },
          {
            label: 'Option 3',
          },
          {
            label: 'Option 4',
          },
        ],
        formControlName: 'other-name',
        writeValue: [
          {
            label: 'Option 2',
          },
          {
            label: 'Option 8',
          },
          {
            label: 'Option 4',
          },
        ],
        inputValue: '[Option 2, Option 4]',
        disabled: false,
        classes: { input: true },
        attributes: {
          autocomplete: 'off',
          class: 'ng-untouched ng-pristine ng-valid',
          'data-focus': 'input',
          name: 'other-name',
          placeholder: 'Some Label',
          spellcheck: 'false',
          tabindex: '0',
          type: 'search',
          uiVibrate: '',
        },
      },
      {
        options: {
          mode: 'select',
          label: 'Some other Label',
          type: 'email',
          autocomplete: 'on',
          multiselect: {
            separator: '/',
            suffix: '',
            prefix: '',
            showCount: true,
          },
        },
        items: [
          {
            label: '1',
            value: 1,
          },
          {
            label: '2',
            value: 2,
          },
          {
            label: '3',
            value: 3,
          },
        ],
        formControlName: 'other-name',
        writeValue: '2',
        inputValue: '2',
        disabled: false,
        classes: { select: true },
        attributes: {
          autocomplete: 'on',
          class: 'ng-untouched ng-pristine ng-valid',
          'data-focus': 'input',
          inert: '',
          name: 'other-name',
          placeholder: 'Some other Label',
          spellcheck: 'false',
          tabindex: '0',
          type: 'email',
          uiVibrate: '',
        },
      },
    ];

    it.each(data)(
      'ui-select should render correctly',
      async ({
        options,
        items,
        formControlName,
        disabled,
        classes,
        attributes,
        writeValue,
        inputValue,
      }: TestData<TestSelectObject>) => {
        await TestBed.configureTestingModule({
          imports: [SelectComponent<TestSelectObject>],
          providers: [provideConfig({ logger: 'OFF' })],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectComponent<TestSelectObject>);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('formControlName', formControlName);
        fixture.componentRef.setInput('options', options);
        fixture.componentRef.setInput('items', items);

        const onChange = vi.fn();
        const onTouched = vi.fn();
        component.registerOnChange(onChange);
        component.registerOnTouched(onTouched);
        component.setDisabledState(disabled);
        component.writeValue(writeValue);

        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));

        expect(fixture.debugElement.classes).toStrictEqual(classes);
        expect({ ...input.attributes, id: null }).toStrictEqual({ ...attributes, id: null });
        expect(input.nativeElement.value).toStrictEqual(inputValue);
      }
    );
  });

  describe("@HostListener('keydown', ['$event'])", () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SelectComponent<TestSelectObject>],
        providers: [provideConfig({ logger: 'OFF' })],
      }).compileComponents();

      fixture = TestBed.createComponent(SelectComponent<TestSelectObject>);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('formControlName', 'keydown');
      fixture.componentRef.setInput('items', [
        {
          value: 1,
          label: 'Option A',
        },
        {
          value: 2,
          label: 'Option B',
        },
        {
          value: 3,
          label: 'Option C',
        },
        {
          value: 4,
          label: 'Option D',
        },
        {
          value: 5,
          label: 'Option E',
        },
      ]);
      fixture.componentRef.setInput('options', {
        mode: 'input',
        label: 'Some Label',
        autocomplete: 'on',
        displayItems: 3,
        factory: (label: string) => ({
          label,
          value: 42,
        }),
      });

      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      fixture.detectChanges();
    });

    it('#handleBackspace should not call clear if not empty input', () => {
      vi.spyOn(component.inputRef, 'value', 'get').mockReturnValueOnce('Option B');
      const clearSpy = vi.spyOn(component['selectionS'], 'clear');
      const currentSpy = vi.spyOn(component['itemsS'], 'current', 'set');
      const input = fixture.debugElement.query(By.css('input'));
      const event = {
        code: 'Backspace',
        target: input.nativeElement,
      } as unknown as KeyboardEvent;

      component.onKeyDown(event);

      expect(clearSpy).not.toHaveBeenCalled();
      expect(currentSpy).not.toHaveBeenCalled();
    });

    it('#handleBackspace should call clear if empty input', () => {
      vi.spyOn(component.inputRef, 'value', 'get').mockReturnValueOnce('1');
      const clearSpy = vi.spyOn(component['selectionS'], 'clear');
      const currentSpy = vi.spyOn(component['itemsS'], 'current', 'set');
      const input = fixture.debugElement.query(By.css('input'));
      const event = {
        code: 'Backspace',
        target: input.nativeElement,
      } as unknown as KeyboardEvent;

      component.onKeyDown(event);

      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(currentSpy).toHaveBeenCalledTimes(1);
      expect(currentSpy).toHaveBeenCalledWith(null);
    });

    it('#onKeyDown browser autofill if possible', () => {
      const selectSpy = vi.spyOn(component['selectionS'], 'select');
      const input = fixture.debugElement.query(By.css('input'));
      const event = {
        code: undefined,
        numCode: -1,
        which: undefined,
        target: input.nativeElement,
      } as unknown as KeyboardEvent;
      input.nativeElement.value = 'Option B';

      component.onKeyDown(event);

      expect(input.nativeElement.value).toStrictEqual('Option B');
      expect(selectSpy).toHaveBeenCalledWith({
        created: undefined,
        hash: '5497124399c41cfbf6e1f77a48dcae7b7faaeb01',
        item: {
          label: 'Option B',
          value: 2,
        },
        label: 'Option B',
        selected: false,
      });
    });

    it('#onKeyDown handle ArrowDown, ArrowUp, PageDown, PageUp single select', () => {
      vi.spyOn(component['focusS'], 'focusElement').mockReturnValue('select');
      const selectSpy = vi.spyOn(component['selectionS'], 'select');
      const currentSpy = vi.spyOn(component['itemsS'], 'current', 'set');
      const input = fixture.debugElement.query(By.css('input'));
      const event = {
        code: 'ArrowDown',
        which: undefined,
        preventDefault: vi.fn(),
        target: input.nativeElement,
      } as unknown as KeyboardEvent;

      const uiOptions = component['itemsS'].setAllItems([
        {
          value: 0,
          label: 'Option A',
        },
        {
          value: 1,
          label: 'Option B',
        },
        {
          value: 2,
          label: 'Option C',
        },
        {
          value: 3,
          label: 'Option D',
        },
        {
          value: 4,
          label: 'Option E',
        },
      ]);
      component.onKeyDown({ ...event, code: 'ArrowDown' });
      component.onKeyDown({ ...event, code: 'ArrowDown' });
      component.onKeyDown({ ...event, code: 'ArrowUp' });
      component.onKeyDown({ ...event, code: 'ArrowUp' });
      component.onKeyDown({ ...event, code: 'PageUp' });
      component.onKeyDown({ ...event, code: 'PageDown' });

      expect(selectSpy).toHaveBeenCalledTimes(6);
      expect(selectSpy).toHaveBeenNthCalledWith(1, uiOptions[0]);
      expect(selectSpy).toHaveBeenNthCalledWith(2, uiOptions[1]);
      expect(selectSpy).toHaveBeenNthCalledWith(3, uiOptions[0]);
      expect(selectSpy).toHaveBeenNthCalledWith(4, uiOptions[4]);
      expect(selectSpy).toHaveBeenNthCalledWith(5, uiOptions[1]);
      expect(selectSpy).toHaveBeenNthCalledWith(6, uiOptions[4]);
      expect(currentSpy).toHaveBeenCalledTimes(6);
      expect(currentSpy).toHaveBeenNthCalledWith(1, uiOptions[0]);
      expect(currentSpy).toHaveBeenNthCalledWith(2, uiOptions[1]);
      expect(currentSpy).toHaveBeenNthCalledWith(3, uiOptions[0]);
      expect(currentSpy).toHaveBeenNthCalledWith(4, uiOptions[4]);
      expect(currentSpy).toHaveBeenNthCalledWith(5, uiOptions[1]);
      expect(currentSpy).toHaveBeenNthCalledWith(6, uiOptions[4]);
    });

    it('#onKeyDown browser autofill if not possible', () => {
      const selectSpy = vi.spyOn(component['selectionS'], 'select');
      const input = fixture.debugElement.query(By.css('input'));
      const event = {
        code: undefined,
        numCode: -1,
        which: undefined,
        target: input.nativeElement,
      } as unknown as KeyboardEvent;
      input.nativeElement.value = 'Option Z';

      component.onKeyDown(event);

      expect(input.nativeElement.value).toStrictEqual('Option Z');
      expect(selectSpy).toHaveBeenCalledWith({
        created: true,
        hash: 'd0a3ed0eeb271f830fbc9631c536bead8fc6aa9c',
        item: {
          label: 'Option Z',
          value: 42,
        },
        label: 'Option Z',
        selected: false,
      });
    });
  });

  describe("@HostListener('focusin', ['$event'])", () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SelectComponent<TestSelectObject>],
        providers: [provideConfig({ logger: 'OFF' })],
      }).compileComponents();

      fixture = TestBed.createComponent(SelectComponent<TestSelectObject>);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('formControlName', 'focusin');
      fixture.componentRef.setInput('items', [
        {
          value: 1,
          label: 'Option A',
        },
        {
          value: 2,
          label: 'Option B',
        },
        {
          value: 3,
          label: 'Option C',
        },
      ]);
      fixture.componentRef.setInput('options', {
        mode: 'input',
        label: 'Some Label',
        autocomplete: 'on',
        factory: (label: string) => ({
          label,
          value: 42,
        }),
      });

      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      fixture.detectChanges();
    });

    it('#onFocus related target input focus input', () => {
      const focusSpy = vi.spyOn(component.inputRef, 'focus');
      const relatedTarget = document.createElement('div');
      relatedTarget.setAttribute('data-focus', 'input');
      const event = { relatedTarget } as unknown as FocusEvent;

      component.onFocus(event);

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('#onFocus on wrapper should be select', () => {
      const focusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
      const target = component.wrapperRef.nativeElement;
      const event = { target } as unknown as FocusEvent;

      component.onFocus(event);

      expect(focusSpy).toHaveBeenCalledWith('select');
    });

    it('#onFocus on label should be label', () => {
      const focusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
      const target = component.inputRef.labelElement?.nativeElement;
      const event = { target } as unknown as FocusEvent;

      component.onFocus(event);

      expect(focusSpy).toHaveBeenCalledWith('label');
    });

    it('#onFocus on div.trap should be label', () => {
      const focusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
      const target = document.createElement('div');
      target.classList.add('trap');
      const event = { target } as unknown as FocusEvent;

      component.onFocus(event);

      expect(focusSpy).toHaveBeenCalledWith('label');
    });

    const testFocusData: TestFocusData[] = [
      {
        focus: 'badge',
        expected: 'badge',
        warnCalls: 0,
      },
      {
        focus: 'input',
        expected: 'input',
        warnCalls: 0,
      },
      {
        focus: 'label',
        expected: 'label',
        warnCalls: 0,
      },
      {
        focus: 'select',
        expected: 'select',
        warnCalls: 0,
      },
      {
        focus: 'list',
        expected: 'list',
        warnCalls: 0,
      },
      {
        focus: 'option',
        expected: 'option',
        warnCalls: 0,
      },
      {
        focus: 'unknown',
        expected: null,
        warnCalls: 1,
      },
    ];

    it.each(testFocusData)(
      '#onFocus data-focus=$focus should be $expected',
      async ({ focus, expected, warnCalls }: TestFocusData) => {
        const loggerSpy = vi.spyOn(component['logger'], 'warn');
        const focusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
        const target = document.createElement('div');
        target.setAttribute('data-focus', focus);
        const event = { target } as unknown as FocusEvent;

        component.onFocus(event);

        expect(focusSpy).toHaveBeenCalledWith(expected);
        expect(loggerSpy).toHaveBeenCalledTimes(warnCalls);
      }
    );
  });

  describe("@HostListener('focusout', ['$event'])", () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SelectComponent<TestSelectObject>],
        providers: [provideConfig({ logger: 'OFF' })],
      }).compileComponents();

      fixture = TestBed.createComponent(SelectComponent<TestSelectObject>);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('formControlName', 'focusin');
      fixture.componentRef.setInput('items', [
        {
          value: 1,
          label: 'Option A',
        },
        {
          value: 2,
          label: 'Option B',
        },
        {
          value: 3,
          label: 'Option C',
        },
      ]);
      fixture.componentRef.setInput('options', {
        mode: 'input',
        label: 'Some Label',
        autocomplete: 'on',
        factory: (label: string) => ({
          label,
          value: 42,
        }),
      });

      fixture.detectChanges();
    });

    it('#onBlur without related target should lose focus', () => {
      const focusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
      const patchValueSpy = vi.spyOn(component.inputRef, 'patchValue');
      const event = { relatedTarget: null } as unknown as FocusEvent;

      component.onBlur(event);

      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(focusSpy).toHaveBeenCalledWith(null);
      expect(patchValueSpy).toHaveBeenCalledWith('');
    });

    it('#onBlur with element outside should lose focus', () => {
      const focusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
      const patchValueSpy = vi.spyOn(component.inputRef, 'patchValue');
      const relatedTarget = document.createElement('div');
      const event = { relatedTarget } as unknown as FocusEvent;

      component.onBlur(event);

      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(focusSpy).toHaveBeenCalledWith(null);
      expect(patchValueSpy).toHaveBeenCalledWith('');
    });

    it('#onBlur should select single option', () => {
      component['itemsS'].setAllItems([
        {
          label: 'Option 1',
        },
      ]);
      const selectSpy = vi.spyOn(component['selectionS'], 'select');
      const patchValueSpy = vi.spyOn(component.inputRef, 'patchValue');
      const relatedTarget = document.createElement('div');
      const event = { relatedTarget } as unknown as FocusEvent;

      component.onBlur(event);

      expect(selectSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenCalledWith({
        created: undefined,
        hash: 'ca76cdc1b0e58bc6c5f9766d4bc067849c4468ca',
        item: {
          label: 'Option 1',
        },
        label: 'Option 1',
        selected: false,
      });
      expect(patchValueSpy).toHaveBeenCalledWith('Option 1');
    });

    it('#badgePressed with action:clear should clear and focus input', () => {
      const clearSpy = vi.spyOn(component.inputRef, 'clear');
      const focusSpy = vi.spyOn(component.inputRef, 'focus');

      component.badgePressed('clear');

      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('#callOnTouched should focus wrapper element if not', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      const focusSpy = vi.spyOn(component.wrapperRef.nativeElement, 'focus');
      vi.spyOn(component['focusS'], 'focusElement').mockReturnValue('input');

      component['callOnTouched']();

      expect(onTouched).toHaveBeenCalledTimes(1);
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    const focusInputElements: FocusElement[] = ['badge', 'select'];

    it.each(focusInputElements)('#handleEnter should focus input on $0', focusElement => {
      const focusSpy = vi.spyOn(component.inputRef, 'focus');
      vi.spyOn(component['focusS'], 'focusElement').mockReturnValue(focusElement);

      component['handleEnter']({} as unknown as KeyboardEvent);

      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    const handleCursorElements: FocusElement[] = ['input', 'list'];

    it.each(handleCursorElements)(
      '#handleEnter should handle cursor single select $0',
      focusElement => {
        const patchValueSpy = vi.spyOn(component.inputRef, 'patchValue');
        const toggleSpy = vi.spyOn(component['selectionS'], 'toggle');
        vi.spyOn(component['focusS'], 'focusElement').mockReturnValue(focusElement);

        const item = component['itemsS'].getFromAllByIndex(1);
        component['itemsS'].current = item;

        component['handleEnter']({ preventDefault: vi.fn() } as unknown as KeyboardEvent);
        component['handleEnter']({ preventDefault: vi.fn() } as unknown as KeyboardEvent);

        expect(patchValueSpy).toHaveBeenCalledTimes(1);
        expect(toggleSpy).toHaveBeenCalledTimes(1);
        expect(patchValueSpy).toHaveBeenCalledWith('Option B');
        expect(toggleSpy).toHaveBeenCalledWith(item);
      }
    );

    it.each(handleCursorElements)(
      '#handleEnter should handle cursor multiselect $0',
      focusElement => {
        const onTouched = vi.fn();
        component.registerOnTouched(onTouched);
        const toggleSpy = vi.spyOn(component['selectionS'], 'toggle');
        vi.spyOn(component['focusS'], 'focusElement').mockReturnValue(focusElement);
        vi.spyOn(component['configS'], 'isMultiple').mockReturnValue(true);

        const item = component['itemsS'].getFromAllByIndex(2);
        component['itemsS'].current = item;

        component['handleEnter']({ preventDefault: vi.fn() } as unknown as KeyboardEvent);
        component['handleEnter']({ preventDefault: vi.fn() } as unknown as KeyboardEvent);
        component['handleEnter']({ preventDefault: vi.fn() } as unknown as KeyboardEvent);

        expect(onTouched).toHaveBeenCalledTimes(3);
        expect(toggleSpy).toHaveBeenCalledTimes(3);
        expect(toggleSpy).toHaveBeenCalledWith(item);
      }
    );

    // it.each(handleCursorElements)('#handleEnter should fix input if 1 option $0', focusElement => {
    //   const patchValueSpy = vi.spyOn(component.inputRef, 'patchValue');
    //   const toggleSpy = vi.spyOn(component['selectionS'], 'toggle');
    //   vi.spyOn(component['focusS'], 'focusElement').mockReturnValue(focusElement);
    //
    //   component['itemsS'].current = null;
    //   component['itemsS'].setSearchString('Option B');
    //
    //   component['handleEnter']({ preventDefault: vi.fn() } as unknown as KeyboardEvent);
    //
    //   expect(toggleSpy).not.toHaveBeenCalled();
    //   expect(patchValueSpy).toHaveBeenCalledTimes(1);
    //   expect(patchValueSpy).toHaveBeenCalledWith('item.label');
    // });
  });
});
