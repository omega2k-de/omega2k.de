import { Component, computed, inject, input } from '@angular/core';
import { CONFIG, UpdateStatus } from '@o2k/core';

@Component({
  selector: 'ui-version',
  templateUrl: './version.component.html',
  styles: `
    :host {
      display: inline;
      font-size: inherit;

      &:before {
        content: 'v' / '';
        speak: none;
      }

      .hash,
      .version {
        font-size: inherit;
      }

      .hash:before {
        content: '@';
      }

      .hash {
        overflow: clip;
        max-width: 0;
        width: 0;
        display: none;
        transition: all var(--animate-duration) var(--animate-duration) ease-in-out;
      }

      &:hover,
      &:focus,
      &:focus-visible,
      &:focus-within {
        .hash {
          transition: all var(--animate-duration) var(--animate-duration) ease-in-out;
          max-width: 100%;
          width: auto;
          display: inline-block;
        }
      }
    }
  `,
})
export class VersionComponent {
  protected config = inject(CONFIG, { optional: true });
  readonly current = input<UpdateStatus>();
  protected data = computed(() => this.current() ?? this.config);
}
