import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '../tokens';
import { fromEvent, shareReplay, startWith } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScrollProgressService {
  private readonly doc = inject(DOCUMENT);
  private readonly win = inject(WINDOW, { optional: true });

  readonly progress$ = this.createProgress$();

  private createProgress$() {
    if (!this.win) {
      return fromEvent<never>([] as unknown as EventTarget, 'noop').pipe(map(() => 0));
    }

    const win = this.win;
    return fromEvent(win, 'scroll').pipe(
      startWith(null),
      map(() => {
        const docEl = this.doc.documentElement;
        const body = this.doc.body;
        const scrollTop = win.pageYOffset ?? docEl.scrollTop ?? body.scrollTop ?? 0;
        const scrollHeight =
          (docEl.scrollHeight ?? body.scrollHeight ?? 0) -
          (win.innerHeight ?? docEl.clientHeight ?? 0);
        if (scrollHeight > 0) {
          const ratio = (scrollTop / scrollHeight) * 100;
          return Math.floor(Math.max(0, Math.min(100, ratio)));
        }
        return 0;
      }),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
