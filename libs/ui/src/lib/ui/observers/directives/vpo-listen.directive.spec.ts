import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { VpoListenDirective } from './vpo-listen.directive';

@Component({
  imports: [CommonModule, VpoListenDirective],
  template: `<div uiVpoListen="foo">me</div>`,
})
class TestComponent {}

describe('VpoListenDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, VpoListenDirective],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
