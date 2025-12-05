import { Component, DebugElement } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { describe } from 'vitest';
import { RouterLinkDirective } from '.';

@Component({
  template: ` <a
      uiRouterLink
      routerLink="/home"
      [queryParams]="{ test: true, foo: 'bar', null: null, und: undefined }"
      >home</a
    ><a
      uiRouterLink
      [routerLink]="['foo', 'bar']"
      [queryParams]="{ test: true, foo: 'bar', null: null, und: undefined }"
      >home</a
    ><a
      uiRouterLink
      routerLink="https://omega2k.de/absolute#hash"
      [queryParams]="{ test: true, foo: 'bar', null: null, und: undefined }"
      >home</a
    >`,
  imports: [RouterLink, RouterLinkDirective],
})
class TestComponent {}

describe('RouterLinkDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let routerLinks: DebugElement[];

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [RouterLinkDirective, TestComponent],
      providers: [provideRouter([])],
    }).createComponent(TestComponent);
    fixture.detectChanges();

    routerLinks = fixture.debugElement.queryAll(By.directive(RouterLinkDirective));
  });

  describe('should render correctly', () => {
    it('test link amount should be 3', () => {
      expect(routerLinks.length).toBe(3);
    });

    const data = [
      {
        index: 0,
        href: `${location.protocol}//${location.host}/home`,
      },
      {
        index: 1,
        href: `${location.protocol}//${location.host}/foo/bar`,
      },
      {
        index: 2,
        href: `https://omega2k.de/absolute#hash`,
      },
    ];

    it.each(data)('at index $index with href $href', ({ index, href }) => {
      expect(routerLinks[index]?.nativeElement.href).toStrictEqual(href);
    });
  });
});
