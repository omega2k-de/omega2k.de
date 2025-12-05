import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { VpoObserveDirective } from './vpo-observe.directive';

@Component({
  imports: [CommonModule, VpoObserveDirective],
  template: `<div [uiVpoObserve]="{}">me</div>`,
})
class TestComponent {}

describe('VpoObserveDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, VpoObserveDirective],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
