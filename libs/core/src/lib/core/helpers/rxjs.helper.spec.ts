import { of } from 'rxjs';
import { countdownAnimationFrame } from './rxjs.helper';

describe('rxjs helper', () => {
  describe('#countdownAnimationFrame', () => {
    it('emits exact dyadic fractions from 1 down to 0', () => {
      const completeSpy = vi.fn();
      const frames$ = of(
        { timestamp: 0, elapsed: 0 },
        { timestamp: 100, elapsed: 100 },
        { timestamp: 200, elapsed: 200 },
        { timestamp: 300, elapsed: 300 },
        { timestamp: 400, elapsed: 400 },
        { timestamp: 500, elapsed: 500 },
        { timestamp: 600, elapsed: 600 },
        { timestamp: 700, elapsed: 700 },
        { timestamp: 800, elapsed: 800 }
      );

      const values: number[] = [];
      countdownAnimationFrame(800, frames$).subscribe({
        next: v => values.push(v),
        complete: completeSpy,
      });

      expect(values).toStrictEqual([1, 0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0]);
      expect(completeSpy).toHaveBeenCalledTimes(1);
    });

    it('returns 0 immediately for non-positive duration', () => {
      const values: number[] = [];
      countdownAnimationFrame(0).subscribe(v => values.push(v));
      expect(values).toEqual([0]);
    });
  });
});
