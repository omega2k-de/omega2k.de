import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressRingDirective, UiProgressRingConfig } from './progress-ring.directive';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, ProgressRingDirective],
  template: `
    <button uiProgressRing [progress]="progress()" [config]="config()">some button text</button>
  `,
})
class TestComponent {
  progress = signal<number | null>(null);
  config = signal<UiProgressRingConfig | null>(null);
}

function readStyles(el: HTMLElement) {
  const style = el.style as CSSStyleDeclaration;
  return {
    border: style.border,
    background: style.background,
    backgroundClip: style.backgroundClip,
  };
}

describe('ProgressRingDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let buttonElement: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    buttonElement = fixture.nativeElement.querySelector('button');
  });

  it('clears all styles when progress is null', () => {
    testComponent.progress.set(null);
    testComponent.config.set(null);
    fixture.detectChanges();

    const s = readStyles(buttonElement);
    expect(s.border).toBe('');
    expect(s.background).toBe('');
    expect(s.backgroundClip).toBe('');
  });

  it('applies ring (elapsed mode) and animation when remaining is set', () => {
    testComponent.progress.set(0.25);
    testComponent.config.set({
      width: 4,
      color: 'red',
      trackColor: 'transparent',
      centerColor: '#123456',
    });
    fixture.detectChanges();

    const s = readStyles(buttonElement);
    expect(s.border).toBe('4px solid rgba(0, 0, 0, 0)');
    const expected = `radial-gradient(circle at 50% 50%, rgb(18, 52, 86) 100%, rgb(18, 52, 86) 100%) padding-box, border-box`;
    expect(s.background).toBe(expected);
    expect(s.backgroundClip).toBe('padding-box, border-box');
  });

  it('applies remaining mode for ring', () => {
    testComponent.progress.set(0.5);
    testComponent.config.set({
      width: '0.25rem',
      color: 'green',
      trackColor: 'rgba(0,0,0,0.2)',
      centerColor: '#fff',
      mode: 'remaining',
    });
    fixture.detectChanges();

    const s = readStyles(buttonElement);
    expect(s.border).toBe('0.25rem solid rgba(0, 0, 0, 0)');
    const expected = `radial-gradient(circle at 50% 50%, rgb(255, 255, 255) 100%, rgb(255, 255, 255) 100%) padding-box, border-box`;
    expect(s.background).toBe(expected);
    expect(s.backgroundClip).toBe('padding-box, border-box');
  });

  it('renders overlay segment above center when configured', () => {
    testComponent.progress.set(0.1);
    testComponent.config.set({
      width: 3,
      color: 'currentColor',
      trackColor: 'transparent',
      centerColor: '#eee',
      overlayColor: 'rgba(0,0,0,0.18)',
    });
    fixture.detectChanges();

    const s = readStyles(buttonElement);
    const expected = `padding-box, radial-gradient(circle at 50% 50%, rgb(238, 238, 238) 100%, rgb(238, 238, 238) 100%) padding-box, border-box`;
    expect(s.background).toBe(expected);
    expect(s.backgroundClip).toBe('padding-box, padding-box, border-box');
  });

  it('updates progress custom property and removes styles when progress becomes null', () => {
    testComponent.progress.set(0.3);
    testComponent.config.set({
      width: 2,
      color: '#f00',
      trackColor: 'transparent',
      centerColor: '#000',
    });
    fixture.detectChanges();

    testComponent.progress.set(null);
    fixture.detectChanges();
    const s = readStyles(buttonElement);
    expect(s.background).toBe('');
    expect(s.border).toBe('');
  });
});
