import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideConfig } from '@o2k/core';
import { describe } from 'vitest';
import { ScrollIntoViewDirective } from '.';

@Component({
  template: ` <div uiScrollIntoView>lorem ipsum</div>`,
  imports: [ScrollIntoViewDirective],
})
class TestComponent {
  @ViewChild(ScrollIntoViewDirective) uiScrollIntoView!: ScrollIntoViewDirective;
}

describe('ScrollIntoViewDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, ScrollIntoViewDirective],
      providers: [provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('should render correctly', () => {
    it('#ngAfterViewInit should contain b element', () => {
      component.uiScrollIntoView.ngAfterViewInit();

      const b = fixture.debugElement.query(By.css('b:last-child'));
      expect(b.nativeElement.hasAttribute('data-scroll-into-view')).toStrictEqual(true);
      expect(b.nativeElement.getAttribute('tabindex')).toStrictEqual('0');
      expect(b.nativeElement.getAttribute('style')).toStrictEqual(
        'position: absolute; inset: 3px; z-index: 1; cursor: pointer; pointer-events: visible; border-radius: inherit; background-color: rgba(0, 0, 0, 0.1);'
      );
    });

    it('#enable should set pointer-events on b element', () => {
      component.uiScrollIntoView.enable();

      const b = fixture.debugElement.query(By.css('b:last-child'));
      expect(b.nativeElement.style.pointerEvents).toStrictEqual('visible');
      expect(b.nativeElement.getAttribute('tabindex')).toStrictEqual('0');
    });

    it('#disable should set pointer-events on b element', () => {
      component.uiScrollIntoView.disable();

      const b = fixture.debugElement.query(By.css('b:last-child'));
      expect(b.nativeElement.style.pointerEvents).toStrictEqual('none');
      expect(b.nativeElement.getAttribute('tabindex')).toStrictEqual('-1');
    });

    it('#onClick should scroll into view and disable', () => {
      component.uiScrollIntoView.onClick();

      const b = fixture.debugElement.query(By.css('b:last-child'));
      expect(b.nativeElement.style.pointerEvents).toStrictEqual('visible');
      // todo
    });

    it('#ngOnDestroy should remove b element', () => {
      component.uiScrollIntoView.ngOnDestroy();

      const b = fixture.debugElement.query(By.css('b:last-child'));
      expect(b).toBeFalsy();
    });
  });
});
