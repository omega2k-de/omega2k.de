import { CommonModule } from '@angular/common';
import { Component, DebugElement, ElementRef, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MixedBooleanType, provideConfig } from '@o2k/core';
import { noop } from 'rxjs';
import { FocusTrapComponent } from './focus-trap.component';

@Component({
  imports: [CommonModule, FocusTrapComponent],
  template: ` <div #div1 tabindex="0"></div>
    <div #div2 tabindex="0"></div>
    <ui-focus-trap [disabled]="disabled()" (trapFocus)="onFocus($event)" />`,
})
class TestComponent {
  @ViewChild(FocusTrapComponent) trap!: FocusTrapComponent;
  @ViewChild('div1') div1!: ElementRef<HTMLDivElement>;
  @ViewChild('div2') div2!: ElementRef<HTMLDivElement>;
  disabled = signal<MixedBooleanType>(true);
  target = signal<HTMLElement | undefined>(undefined);
  onFocus = (_event: FocusEvent) => noop();
}

describe('FocusTrapComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, FocusTrapComponent],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create disabled', () => {
    const spy = vi.spyOn(component, 'onFocus');
    const debugElement: DebugElement = fixture.debugElement;
    const trap = debugElement.query(By.css('ui-focus-trap'));
    component.trap.onFocus(new FocusEvent('focusin'));
    expect(component.trap).toBeInstanceOf(FocusTrapComponent);
    expect(spy).toHaveBeenCalledTimes(0);
    expect(trap.nativeElement.getAttribute('tabindex')).toStrictEqual('-1');
  });

  it('should trigger enabled', () => {
    const debugElement: DebugElement = fixture.debugElement;
    const trap = debugElement.query(By.css('ui-focus-trap'));
    const event = new FocusEvent('focusin');
    const spy = vi.spyOn(component, 'onFocus');
    component.disabled.set(false);
    fixture.detectChanges();
    component.trap.onFocus(event);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(event);
    expect(trap.nativeElement.getAttribute('tabindex')).toStrictEqual('0');
  });
});
