import { CommonModule } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutoIdDirective } from './auto-id.directive';

@Component({
  imports: [CommonModule, AutoIdDirective],
  template: `<label for [uiAutoId]="input">help</label><input #input />`,
})
class TestComponent {}

describe('AutoIdDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  vi.mock('object-hash', () => ({
    default: vi.fn().mockReturnValue('12345678'),
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, AutoIdDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const debugElement: DebugElement = fixture.debugElement;
    const label = debugElement.query(By.css('label'));
    const input = debugElement.query(By.css('input'));
    expect(label.nativeElement.getAttribute('for')).toStrictEqual('12345678');
    expect(input.nativeElement.getAttribute('id')).toStrictEqual('12345678');
  });
});
