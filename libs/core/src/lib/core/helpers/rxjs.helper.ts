import { animationFrames, defer, map, Observable, of, startWith, takeWhile } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export function countdownAnimationFrame(
  durationMs: number,
  frames$: Observable<{ timestamp: number; elapsed: number }> = animationFrames()
): Observable<number> {
  if (durationMs <= 0) {
    return of(0);
  }

  return defer(() => {
    let t0: number | null = null;
    return frames$.pipe(
      map(({ timestamp }) => {
        if (t0 === null) {
          t0 = timestamp;
        }
        const progress = (timestamp - t0) / durationMs;
        const clamped = Math.min(Math.max(progress, 0), 1);
        return 1 - clamped;
      }),
      startWith(1),
      distinctUntilChanged(),
      takeWhile(v => v > 0, true)
    );
  });
}
