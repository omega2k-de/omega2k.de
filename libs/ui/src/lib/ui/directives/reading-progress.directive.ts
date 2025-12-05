import { computed, Directive, inject, input, InputSignal } from '@angular/core';
import { ReadingProgressStorage } from '@o2k/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[uiReadingProgress]',
  exportAs: 'instance',
})
export class ReadingProgressDirective {
  readonly key: InputSignal<number | null> = input<number | null>(null, {
    alias: 'uiReadingProgress',
  });
  private readonly storage = inject(ReadingProgressStorage);
  private readonly progressMap = toSignal(this.storage.progress$, {
    initialValue: new Map<number, number>(),
  });
  readonly progress = computed(() => {
    const key = this.key();
    const map = this.progressMap();
    if (!key || !map.size) {
      return 0;
    }
    return map.get(key) ?? 0;
  });
}
