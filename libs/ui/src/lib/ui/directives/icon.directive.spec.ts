import { CommonModule } from '@angular/common';
import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiIconSizeType, UiIconType } from '@o2k/core';
import { IconDirective } from '.';

@Component({
  imports: [CommonModule, IconDirective],
  template: ` <button [uiIcon]="icon()" [size]="size()">help</button>`,
})
class TestComponent {
  icon = signal<UiIconType | null>('help');
  size = signal<UiIconSizeType>('default');
}

describe('IconDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, IconDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const debugElement: DebugElement = fixture.debugElement;
    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('uiIcon')).toStrictEqual('help');
  });

  it('should remove an instance', () => {
    const debugElement: DebugElement = fixture.debugElement;
    component.icon.set(null);
    fixture.detectChanges();
    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.hasAttribute('uiIcon')).toStrictEqual(false);
  });

  it('should change size', () => {
    const debugElement: DebugElement = fixture.debugElement;
    component.icon.set('dashboard');
    component.size.set('xxl');
    fixture.detectChanges();
    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('uiIcon')).toStrictEqual('dashboard');
    expect(button.nativeElement.getAttribute('size')).toStrictEqual('xxl');
  });

  it('should remove size', () => {
    const debugElement: DebugElement = fixture.debugElement;
    component.size.set('xxl');
    component.size.set('default');
    fixture.detectChanges();
    const button = debugElement.query(By.css('button'));
    expect(button.nativeElement.hasAttribute('size')).toStrictEqual(false);
  });
});
