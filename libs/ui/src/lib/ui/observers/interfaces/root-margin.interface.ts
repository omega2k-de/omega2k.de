import { VpoObserveConfig } from './config.interface';

export interface RootMarginInterface {
  toObject(precision?: number): RootMarginObject;
  toString(precision?: number): string;
  margins(precision?: number): RootMarginsInterface;
  set viewPort(viewPort: RootMarginViewport);
  set extraMargins(extraMargins: VpoObserveConfig['extraMargins'] | undefined);
  get extraMargin(): string;
  get viewBox(): RootMarginViewport;
  get top(): number;
  get right(): number;
  get bottom(): number;
  get left(): number;
  get scale(): number;
  get width(): number;
  get height(): number;
}

export interface RootVarsObjectInterface {
  [key: string]: number;
}

export interface RootMarginsInterface extends RootVarsObjectInterface {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type RootMarginObject = Pick<
  RootMarginInterface,
  'top' | 'right' | 'bottom' | 'left' | 'scale' | 'width' | 'height'
>;

export interface RootMarginViewport {
  width: number;
  height: number;
  scale: number;
  pageTop: number;
  pageLeft: number;
  offsetLeft: number;
  offsetTop: number;
  angle: Window['screen']['orientation']['angle'];
  orientation: Window['screen']['orientation']['type'];
  screenWidth: Window['screen']['width'];
  screenHeight: Window['screen']['height'];
  innerWidth: Window['innerWidth'];
  innerHeight: Window['innerHeight'];
}

export type RootMarginToPixViewbox = Pick<RootMarginViewport, 'height' | 'width' | 'scale'>;
