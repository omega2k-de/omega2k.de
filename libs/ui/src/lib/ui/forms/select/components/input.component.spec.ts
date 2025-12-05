import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideConfig } from '@o2k/core';
import { InputComponent } from '.';
import { ConfigService, FocusService, ItemsService, SelectionService, SelectObject } from '..';

describe('InputComponent', () => {
  let component: InputComponent<SelectObject>;
  let fixture: ComponentFixture<InputComponent<SelectObject>>;

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent<SelectObject>],
      providers: [
        provideConfig({ logger: 'OFF' }),
        ConfigService<SelectObject>,
        FocusService<SelectObject>,
        ItemsService<SelectObject>,
        SelectionService<SelectObject>,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent<SelectObject>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#patchValue and #value getter should patch and read input', () => {
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    component.patchValue('text 123 äöü ß{}', { emitEvent: false, onlySelf: true });
    fixture.detectChanges();

    expect(input.value).toStrictEqual('text 123 äöü ß{}');
    expect(component.value).toStrictEqual('text 123 äöü ß{}');
  });

  it('#clear should clear selection', () => {
    const clearSpy = vi.spyOn(component['selectionS'], 'clear');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.setAttribute('value', 'text 123 äöü ß{}');
    component.patchValue('text 123 äöü ß{}', { emitEvent: false, onlySelf: true });
    fixture.detectChanges();

    component.clear();

    expect(input.nativeElement.value).toStrictEqual('');
    expect(input.attributes).toStrictEqual({
      autocomplete: 'one-time-code',
      class: 'ng-untouched ng-pristine ng-valid',
      'data-focus': 'input',
      id: input.attributes['id'],
      name: '',
      placeholder: '',
      spellcheck: 'false',
      tabindex: '0',
      type: 'text',
      uiVibrate: '',
    });
    expect(component.value).toStrictEqual('');
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('#focus should pull focus to input and cursor at the end', () => {
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    component.patchValue('text 123 äöü ß{}', { emitEvent: false, onlySelf: true });
    input.setSelectionRange(4, 4);
    fixture.detectChanges();

    const serviceFocusSpy = vi.spyOn(component['focusS'], 'focus', 'set');
    const inputFocusSpy = vi.spyOn(input, 'focus');
    const setSelectionRangeSpy = vi.spyOn(input, 'setSelectionRange');

    component.focus();

    expect(inputFocusSpy).toHaveBeenCalledTimes(1);
    expect(setSelectionRangeSpy).toHaveBeenCalledTimes(1);
    expect(setSelectionRangeSpy).toHaveBeenCalledWith(16, 16);
    expect(input.scrollLeft === input.scrollWidth).toStrictEqual(true);
    expect(serviceFocusSpy).toHaveBeenLastCalledWith('input');
  });

  it('#onSelect todo', () => {
    const event = new Event('select');
    component.onSelect(event);
  });
});
