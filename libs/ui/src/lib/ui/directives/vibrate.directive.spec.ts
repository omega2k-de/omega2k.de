import { CommonModule } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MixedBooleanType, provideConfig } from '@o2k/core';
import { VibrateDirective } from './vibrate.directive';

@Component({
  imports: [CommonModule, VibrateDirective],
  template: `<button [disabled]="disabled" [uiVibrate]="uiVibrate">help</button>`,
})
class TestComponent {
  uiVibrate: VibratePattern | '' = [13, 37];
  disabled: MixedBooleanType = false;
}

describe('VibrateDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, VibrateDirective],
      providers: [provideRouter([]), provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('pointerup should trigger vibrate [13, 37]', () => {
    const vibrateSpy = (window.navigator.vibrate = vi.fn());
    const debugElement: DebugElement = fixture.debugElement;
    const button = debugElement.query(By.css('button'));
    const event = new MouseEvent('pointerup');
    button.nativeElement.dispatchEvent(event);
    expect(vibrateSpy).toHaveBeenCalledWith([13, 37]);
  });

  it('pointerup should trigger vibrate [1, 2, 3, 4, 5]', () => {
    fixture.componentInstance.uiVibrate = [1, 2, 3, 4, 5];
    fixture.detectChanges();

    const vibrateSpy = (window.navigator.vibrate = vi.fn());
    const debugElement: DebugElement = fixture.debugElement;
    const button = debugElement.query(By.css('button'));
    const event = new MouseEvent('pointerup');
    button.nativeElement.dispatchEvent(event);
    expect(vibrateSpy).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
  });

  it('pointerup should trigger vibrate [30, 30] default', () => {
    fixture.componentInstance.uiVibrate = '';
    fixture.detectChanges();

    const vibrateSpy = (window.navigator.vibrate = vi.fn());
    const debugElement: DebugElement = fixture.debugElement;
    const button = debugElement.query(By.css('button'));
    const event = new MouseEvent('pointerup');
    button.nativeElement.dispatchEvent(event);
    expect(vibrateSpy).toHaveBeenCalledWith([30, 30]);
  });

  it('pointerup should not trigger vibrate [30, 30] disabled', () => {
    fixture.componentInstance.uiVibrate = '';
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const vibrateSpy = (window.navigator.vibrate = vi.fn());
    const debugElement: DebugElement = fixture.debugElement;
    const button = debugElement.query(By.css('button'));
    const event = new MouseEvent('pointerup');
    button.nativeElement.dispatchEvent(event);
    expect(vibrateSpy).not.toHaveBeenCalled();
  });
});
