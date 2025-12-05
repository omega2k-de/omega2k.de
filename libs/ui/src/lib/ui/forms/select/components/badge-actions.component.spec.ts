import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { BadgeActionsComponent } from '.';
import { ConfigService, FocusService, SelectionService, SelectObject } from '..';

describe('BadgeActionsComponent', () => {
  let component: BadgeActionsComponent<SelectObject>;
  let fixture: ComponentFixture<BadgeActionsComponent<SelectObject>>;

  beforeEach(async () => {
    window.navigator.vibrate = vi.fn();

    await TestBed.configureTestingModule({
      imports: [BadgeActionsComponent<SelectObject>],
      providers: [
        provideConfig({ logger: 'OFF' }),
        ConfigService<SelectObject>,
        FocusService<SelectObject>,
        SelectionService<SelectObject>,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeActionsComponent<SelectObject>);
    fixture.componentRef.setInput('animationDurationMs', 0);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#vibrate should call navigator.vibrate', () => {
    const config = TestBed.inject(ConfigService);
    const disabledSpy = vi.spyOn(config, 'disabled').mockReturnValue(false);

    component.vibrate();

    expect(disabledSpy).toHaveBeenCalled();
    expect(window.navigator.vibrate).toHaveBeenNthCalledWith(1, 0);
    expect(window.navigator.vibrate).toHaveBeenNthCalledWith(2, [5, 5]);
  });

  it('#vibrate should not call navigator.vibrate if disabled', () => {
    const config = TestBed.inject(ConfigService);
    const disabledSpy = vi.spyOn(config, 'disabled').mockImplementation(() => true);

    component.vibrate();

    expect(disabledSpy).toHaveBeenCalled();
    expect(window.navigator.vibrate).not.toHaveBeenCalled();
  });

  it('#onPressed should not emit output', () => {
    const config = TestBed.inject(ConfigService);
    const disabledSpy = vi.spyOn(config, 'disabled').mockImplementation(() => true);
    const emitSpy = vi.spyOn(component.pressed, 'emit');

    component.onPressed();

    expect(disabledSpy).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('#onPressed should emit output', fakeAsync(() => {
    const badgeFlipSpy = vi.spyOn(component, 'badgeFlip');
    const config = TestBed.inject(ConfigService);
    const disabledSpy = vi.spyOn(config, 'disabled').mockImplementation(() => false);
    const emitSpy = vi.spyOn(component.pressed, 'emit');

    component.onFocus();
    tick(0);
    component.onPressed();

    expect(badgeFlipSpy).toHaveBeenCalledWith(true);
    expect(disabledSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith('clear');
  }));

  it('#onFocus should call badgeFlip and set focus', () => {
    const badgeFlipSpy = vi.spyOn(component, 'badgeFlip');
    const focus = TestBed.inject(FocusService);
    const focusSpy = vi.spyOn(focus, 'focus', 'set');

    component.onFocus();

    expect(badgeFlipSpy).toHaveBeenCalledWith(true);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('#onBlur should call badgeFlip and set focus', () => {
    const badgeFlipSpy = vi.spyOn(component, 'badgeFlip');
    const focus = TestBed.inject(FocusService);
    const focusSpy = vi.spyOn(focus, 'focus', 'set');

    component.onBlur();

    expect(badgeFlipSpy).toHaveBeenCalledWith(false);
    expect(focusSpy).not.toHaveBeenCalled();
  });
});
