import { PercentPx, VpoObserveConfig } from '../interfaces/config.interface';
import {
  RootMarginInterface,
  RootMarginObject,
  RootMarginsInterface,
  RootMarginViewport,
} from '../interfaces/root-margin.interface';

export class RootMarginModel implements RootMarginInterface {
  constructor(
    private _viewPort: RootMarginViewport,
    private _extraMargins?: VpoObserveConfig['extraMargins'],
    private readonly _precision = 0
  ) {
    this._precision = Math.min(Math.max(0, _precision), 20);
  }

  get bottom(): number {
    return (
      this.toPx('bottom', this._extraMargins?.bottom) -
      Math.max(0, this._viewPort.innerHeight - (this._viewPort.offsetTop + this._viewPort.height))
    );
  }

  get extraMargin(): string {
    return [
      this._extraMargins?.top ?? 0,
      this._extraMargins?.right ?? 0,
      this._extraMargins?.bottom ?? 0,
      this._extraMargins?.left ?? 0,
    ]
      .map(n => {
        const s = String(n).replace(/[^-+.0-9px%]+/gi, '');
        if (s.endsWith('px') || s.endsWith('%')) {
          return `${s}`;
        }
        return `${s}px`;
      })
      .join(' ');
  }

  set extraMargins(extraMargins: VpoObserveConfig['extraMargins'] | undefined) {
    this._extraMargins = extraMargins;
  }

  get height(): number {
    return this._viewPort.height;
  }

  get left(): number {
    return this.toPx('left', this._extraMargins?.left) - this._viewPort.offsetLeft;
  }

  margins(precision?: number): RootMarginsInterface {
    return {
      top: this.toPrecision(-1 * this.toPx('top', this._extraMargins?.top), precision),
      right: this.toPrecision(-1 * this.toPx('right', this._extraMargins?.right), precision),
      bottom: this.toPrecision(-1 * this.toPx('bottom', this._extraMargins?.bottom), precision),
      left: this.toPrecision(-1 * this.toPx('left', this._extraMargins?.left), precision),
    };
  }

  get right(): number {
    return (
      this.toPx('right', this._extraMargins?.right) -
      Math.max(0, this._viewPort.innerWidth - (this._viewPort.offsetLeft + this._viewPort.width))
    );
  }

  get scale(): number {
    return this._viewPort.scale;
  }

  toObject(precision?: number): RootMarginObject {
    return {
      top: this.toPrecision(this.top, precision),
      right: this.toPrecision(this.right, precision),
      bottom: this.toPrecision(this.bottom, precision),
      left: this.toPrecision(this.left, precision),
      scale: this.toPrecision(this.scale, precision),
      width: this.toPrecision(this.width, precision),
      height: this.toPrecision(this.height, precision),
    };
  }

  toString(precision?: number): string {
    return [this.top, this.right, this.bottom, this.left]
      .map(n => `${this.toPrecision(n, precision ?? 0)}px`)
      .join(' ');
  }

  get top(): number {
    return this.toPx('top', this._extraMargins?.top) - this._viewPort.offsetTop;
  }

  get viewBox(): RootMarginViewport {
    return this._viewPort;
  }

  set viewPort(viewPort: RootMarginViewport) {
    this._viewPort = viewPort;
  }

  get width(): number {
    return this._viewPort.width;
  }

  toPx(
    side: 'top' | 'right' | 'bottom' | 'left',
    value?: PercentPx,
    viewBox: Pick<RootMarginViewport, 'width' | 'height' | 'scale'> = this._viewPort
  ): number {
    if (!value) {
      return 0;
    }
    const s = String(value).replace(/[^-+.0-9px%]+/gi, '');
    if (s.endsWith('px')) {
      return parseFloat(s) / viewBox.scale;
    }
    if (s.endsWith('%')) {
      const p = parseFloat(s) / 100.0;
      if (side === 'top' || side === 'bottom') {
        return p * viewBox.height;
      }
      return p * viewBox.width;
    }
    return parseFloat(s);
  }

  private toPrecision = (n: number, precision?: number) =>
    Number(n.toFixed(precision ?? this._precision));
}
