import { ReadingProgressDirective } from './reading-progress.directive';
import { Component, DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockProvider } from 'ng-mocks';
import { ReadingProgressStorage } from '@o2k/core';
import { of } from 'rxjs';

@Component({
  imports: [CommonModule, ReadingProgressDirective],
  template: `<div uiReadingProgress key="some-key"></div>`,
})
class TestComponent {}

describe('ReadingProgressDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, ReadingProgressDirective],
      providers: [
        MockProvider(ReadingProgressStorage, {
          progress$: of(new Map<string, number>()),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const debugElement: DebugElement = fixture.debugElement;
    const div = debugElement.query(By.css('div'));
    expect(div.nativeElement.getAttribute('key')).toStrictEqual('some-key');
  });
});
