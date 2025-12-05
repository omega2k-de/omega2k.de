import { progress$ } from './progress.util';
import { VirtualTimeScheduler } from 'rxjs';

type Event = { t: number; kind: 'N'; v: number } | { t: number; kind: 'C' };

function capture(total: number, tick: number) {
  const s = new VirtualTimeScheduler();
  const start = s.now();
  const events: Event[] = [];

  progress$(total, tick, s).subscribe({
    next: v => events.push({ t: s.now() - start, kind: 'N', v }),
    complete: () => events.push({ t: s.now() - start, kind: 'C' }),
  });

  s.flush();
  return events;
}

function last<T>(arr: T[]): T {
  return arr[arr.length - 1] as T;
}

describe('progress$', () => {
  const tol = 1;

  it('emits at t=0, steigt monoton und endet mit 1 (tick teilt total nicht)', () => {
    const total = 250;
    const tick = 100;
    const events = capture(total, tick);

    expect(events[0]).toEqual({ t: 0, kind: 'N', v: 0 });

    const next = events.filter((e): e is Extract<Event, { kind: 'N' }> => e.kind === 'N');

    for (let i = 1; i < next.length; i++) {
      expect(next[i]?.v).toBeGreaterThanOrEqual(next[i - 1]?.v ?? Number.MAX_SAFE_INTEGER);
      expect(next[i]?.v).toBeLessThanOrEqual(1);
    }

    expect(last(next).v).toBe(1);

    const complete = events.find(e => e.kind === 'C');
    expect(Math.abs((complete?.t ?? 0) - total)).toBeLessThanOrEqual(tol);

    expect(last(next).t).toBeLessThanOrEqual(complete?.t ?? -Number.MAX_SAFE_INTEGER);
    expect((complete?.t ?? 0) - last(next).t).toBeLessThanOrEqual(tol);
  });

  it('deckt ein „starkes Sampling“ ab (kleines tick): monotone Treppe, letzte Emission = 1', () => {
    const total = 200;
    const tick = 7;
    const events = capture(total, tick);
    const next = events.filter((e): e is Extract<Event, { kind: 'N' }> => e.kind === 'N');

    expect(next.length).toBeGreaterThan(2);

    for (let i = 1; i < next.length; i++) {
      expect(next[i]?.v).toBeGreaterThanOrEqual(next[i - 1]?.v ?? Number.MAX_SAFE_INTEGER);
      expect(next[i]?.v).toBeLessThanOrEqual(1);
    }

    expect(last(next).v).toBe(1);
  });
});
