import { inject, Injectable } from '@angular/core';
import { WINDOW } from '@o2k/core';
import { fromEvent, map, merge, Observable, of, switchMap, takeUntil, timer } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LongPressService {
  private readonly window?: Window = inject(WINDOW);

  longPressedTarget(target: HTMLElement, duration?: number): Observable<Event> {
    return this.downEvent()
      .pipe(
        switchMap(event =>
          timer(duration ?? 500).pipe(
            map(() => event),
            takeUntil(this.upEvent())
          )
        )
      )
      .pipe(filter(data => target.contains(data.target as Node)));
  }

  private downEvent() {
    if (this.window) {
      return merge(fromEvent(this.window, 'mousedown'), fromEvent(this.window, 'touchstart'));
    }
    return of();
  }

  private upEvent() {
    if (this.window) {
      return merge(fromEvent(this.window, 'mouseup'), fromEvent(this.window, 'touchend'));
    }
    return of();
  }
}
