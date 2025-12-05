import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, effect, forwardRef, inject, input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import hashObject from 'object-hash';
import { DynamicItemInterface } from '../interfaces';
import { DynamicVirtualScrollStrategy } from '../strategies';

@UntilDestroy()
@Directive({
  selector: '[uiDynamicVirtualScroll]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (d: DynamicVirtualScrollDirective) => d._scrollStrategy,
      deps: [forwardRef(() => DynamicVirtualScrollDirective)],
    },
    DynamicVirtualScrollStrategy,
  ],
})
export class DynamicVirtualScrollDirective {
  private lastHash: string | null = null;
  protected readonly _scrollStrategy = inject(DynamicVirtualScrollStrategy);
  messages = input.required<DynamicItemInterface[] | null>();

  constructor() {
    effect(() => {
      const messages = this.messages();
      if (messages) {
        const currentHash = hashObject(messages, { encoding: 'hex' });
        if (!this.lastHash || currentHash !== this.lastHash) {
          this.lastHash = currentHash;
          this._scrollStrategy.updateMessages(messages);
        }
      }
    });
  }
}
