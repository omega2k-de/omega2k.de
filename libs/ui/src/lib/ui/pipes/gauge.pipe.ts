import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { StringHelper } from '@o2k/core';

export interface GaugeParams {
  color: string;
  display: string;
  length: number;
  entropy: number;
  percent: number;
}

interface GaugeColor {
  r: number;
  g: number;
  b: number;
}

@Pipe({
  name: 'gauge',
})
export class GaugePipe implements PipeTransform {
  private localeId = inject(LOCALE_ID);

  private colors: GaugeColor[] = [
    { r: 255, g: 0, b: 0 },
    { r: 255, g: 140, b: 0 },
    { r: 191, g: 64, b: 191 },
    { r: 30, g: 144, b: 255 },
    { r: 124, g: 252, b: 0 },
  ];

  transform(value: string, max = 128, decimals = 1): GaugeParams {
    const length = value.length;
    const entropy = StringHelper.entropy(value);
    const percent = Math.min(100, (entropy / max) * 100);
    const display = `${percent.toLocaleString(this.localeId, this.getLocaleOptions(decimals))} %`;
    const color = this.rgb(entropy, max);
    return {
      length,
      color,
      entropy,
      percent,
      display,
    };
  }

  private getLocaleOptions(decimals: number): Intl.NumberFormatOptions {
    return {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      localeMatcher: 'best fit',
    };
  }

  private interpolate(from: number, to: number, step: number, steps: number): GaugeColor {
    const colorFrom = this.colors[from] as GaugeColor;
    const colorTo = this.colors[to] as GaugeColor;
    const color: GaugeColor = { ...colorFrom };

    for (const key in colorFrom) {
      const a = colorFrom[key as keyof GaugeColor];
      const b = colorTo[key as keyof GaugeColor];
      color[key as keyof GaugeColor] = Math.round(a + ((b - a) / steps) * step);
    }

    return color;
  }

  private rgb(value: number, max: number): string {
    value = Math.max(0, Math.min(max, value));

    const ranges = this.colors.length - 1;
    const range = max / ranges;
    const from = Math.floor(value / range);
    const to = Math.min(ranges, from + 1);
    const color = this.interpolate(from, to, value % range, range);

    return `rgb(${color.r},${color.g},${color.b})`;
  }
}
