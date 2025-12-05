import { inject, Injectable } from '@angular/core';
import { WINDOW } from '@o2k/core';
import { ViewportRootElement, VpoObserveConfig } from '../interfaces/config.interface';
import { RootMarginInterface, RootMarginViewport } from '../interfaces/root-margin.interface';
import { RootMarginModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RootMarginFactory {
  private readonly window?: Window = inject(WINDOW);

  viewBox(): RootMarginViewport {
    const window = this.window;
    const viewport: Partial<VisualViewport> = window?.visualViewport ?? {};
    const { scale, offsetLeft, offsetTop, pageLeft, pageTop, width, height } = viewport;
    const { orientation } = window?.screen ?? {};
    return {
      scale: scale ?? 1,
      offsetLeft: offsetLeft ?? 0,
      offsetTop: offsetTop ?? 0,
      pageLeft: pageLeft ?? 0,
      pageTop: pageTop ?? 0,
      width: width ?? 0,
      height: height ?? 0,
      innerWidth: window?.innerWidth ?? 0,
      innerHeight: window?.innerHeight ?? 0,
      angle: orientation?.angle ?? 0,
      orientation: orientation?.type ?? 'portrait-primary',
      screenWidth: window?.screen.width ?? 0,
      screenHeight: window?.screen.height ?? 0,
    };
  }

  viewPort(element?: ViewportRootElement): RootMarginViewport {
    const viewBox = this.viewBox();
    if (element instanceof Element) {
      const bounding = element.getBoundingClientRect();
      return {
        ...viewBox,
        width: bounding.width,
        height: bounding.height,
        innerWidth: bounding.width,
        innerHeight: bounding.height,
        offsetTop: 0,
        offsetLeft: 0,
        pageTop: element.offsetTop,
        pageLeft: element.offsetLeft,
      };
    }
    return viewBox;
  }

  create(
    element?: ViewportRootElement,
    extraMargins?: VpoObserveConfig['extraMargins'],
    precision?: number
  ): RootMarginInterface {
    const viewPort = this.viewPort(element ?? null);
    return new RootMarginModel(viewPort, extraMargins, precision);
  }
}
