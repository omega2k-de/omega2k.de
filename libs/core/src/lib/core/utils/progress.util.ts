import { asyncScheduler, defer, Observable, SchedulerLike, timer } from 'rxjs';
import { endWith, map, takeUntil } from 'rxjs/operators';

export function progress$(
  totalMs: number,
  tickMs = 1000,
  scheduler: SchedulerLike = asyncScheduler
): Observable<number> {
  return defer(() => {
    const now = 'now' in scheduler ? () => scheduler.now() : () => Date.now();
    const start = now();
    return timer(0, tickMs, scheduler).pipe(
      map(() => {
        const elapsed = now() - start;
        return Math.min(elapsed / totalMs, 1);
      }),
      takeUntil(timer(totalMs, scheduler)),
      endWith(1)
    );
  });
}
