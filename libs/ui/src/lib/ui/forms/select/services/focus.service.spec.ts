import { TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { ConfigService, FocusElement, FocusService } from '.';
import { SelectObject } from '..';

interface FocusTestData {
  focus: FocusElement | null;
  disabled: boolean;
  isFocusTrapDisabled: boolean;
}

describe('FocusService', () => {
  let service: FocusService<SelectObject>;

  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideConfig({ logger: 'OFF' }),
        FocusService<SelectObject>,
        ConfigService<SelectObject>,
      ],
    });
    service = TestBed.inject(FocusService<SelectObject>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const testData: FocusTestData[] = [
    {
      focus: 'badge',
      disabled: false,
      isFocusTrapDisabled: true,
    },
    {
      focus: 'input',
      disabled: false,
      isFocusTrapDisabled: true,
    },
    {
      focus: 'label',
      disabled: false,
      isFocusTrapDisabled: true,
    },
    {
      focus: 'select',
      disabled: false,
      isFocusTrapDisabled: true,
    },
    {
      focus: 'list',
      disabled: false,
      isFocusTrapDisabled: true,
    },
    {
      focus: 'option',
      disabled: false,
      isFocusTrapDisabled: true,
    },
    {
      focus: null,
      disabled: true,
      isFocusTrapDisabled: true,
    },
    {
      focus: null,
      disabled: false,
      isFocusTrapDisabled: false,
    },
  ];

  test.each(testData)(
    'focus $focus should setup (disabled:$disabled)',
    ({ focus, isFocusTrapDisabled, disabled }: FocusTestData) => {
      const onFocusChange = vi.fn();
      vi.spyOn(service['configS'], 'disabled').mockReturnValue(disabled);
      service.focusElement$.subscribe(onFocusChange);
      service.focus = focus;

      expect(service.focus).toStrictEqual(focus);
      expect(service.focusElement()).toStrictEqual(focus);
      expect(service.isFocusTrapDisabled()).toStrictEqual(isFocusTrapDisabled);
      expect(onFocusChange).toHaveBeenLastCalledWith(focus);
    }
  );
});
