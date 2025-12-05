export type PercentPx = number | `${number}%` | `${number}px` | `${number}` | string; // rem bewusst nicht unterstützt
export type ViewportRootElement = HTMLElement | Document | null;

export interface VpoObserveRootMargins {
  top?: PercentPx;
  right?: PercentPx;
  bottom?: PercentPx;
  left?: PercentPx;
}

export interface VpoObserveConfig {
  extraMargins?: VpoObserveRootMargins;
  visibleClass?: HTMLElement['className'] | null; // default: null;
  intersectRatioRootVar?: string | null; // default: null;
  visibilityMinRatio?: number; // default: 1;
  root?: ViewportRootElement; // default: null;
  threshold?: number | number[]; // default: [1];
  precision?: number; // default: 3;
  debug?: boolean; // default: false;
}
