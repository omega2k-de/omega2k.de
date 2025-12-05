import { Component } from '@angular/core';

@Component({
  selector: 'ui-overlay',
  template: `<ng-content />`,
  styles: `
    :host {
      pointer-events: none;
      scrollbar-gutter: stable both-edges;

      position: fixed;
      z-index: 10;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      display: block;

      max-width: 100%;
      max-height: 100%;

      background-color: transparent;

      > * {
        pointer-events: visible;
      }
    }
  `,
})
export class OverlayComponent {}
