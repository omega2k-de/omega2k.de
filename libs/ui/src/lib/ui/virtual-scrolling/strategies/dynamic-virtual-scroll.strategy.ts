import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { distinctUntilChanged, Observable, Subject } from 'rxjs';
import { DynamicHeightPredictor, DynamicItemInterface } from '../interfaces';

const PaddingAbove = 5;
const PaddingBelow = 5;

interface MessageHeight {
  value: number;
  source: 'predicted' | 'actual';
}

export const DYNAMIC_HEIGHT_PREDICTOR = new InjectionToken<DynamicHeightPredictor>(
  'Dynamic Height Predictor'
);

@Injectable()
export class DynamicVirtualScrollStrategy implements VirtualScrollStrategy {
  private _scrolledIndexChange$ = new Subject<number>();
  private _viewport!: CdkVirtualScrollViewport | null;
  private _wrapper!: ChildNode | null;
  private _messages: DynamicItemInterface[] = [];
  private _heightCache = new Map<string, MessageHeight>();
  private _predictor = inject(DYNAMIC_HEIGHT_PREDICTOR, { optional: true });

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    const wrapper = viewport.getElementRef().nativeElement.childNodes[0];
    if (wrapper) {
      this._wrapper = wrapper;
    }

    if (this._messages) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
      this._updateRenderedRange();
    }
  }

  detach(): void {
    this._viewport = null;
    this._wrapper = null;
  }

  onContentRendered(): void {
    // todo
  }

  onContentScrolled(): void {
    if (this._viewport) {
      this._updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (!this._viewport) {
      return;
    }

    this._viewport.setTotalContentSize(this._getTotalHeight());
    this._updateRenderedRange();
  }

  onRenderedOffsetChanged(): void {
    // todo
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this._viewport) {
      return;
    }

    const offset = this._getOffsetByMsgIdx(index);
    this._viewport.scrollToOffset(offset, behavior);
  }

  readonly scrolledIndexChange: Observable<number> =
    this._scrolledIndexChange$.pipe(distinctUntilChanged());

  /**
   * Update the messages array.
   *
   * @param messages
   */
  updateMessages(messages: DynamicItemInterface[]) {
    this._messages = messages;

    if (this._viewport) {
      this._viewport.checkViewportSize();
    }
  }

  /**
   * Returns the total height of the scrollable container
   * given the size of the elements.
   */
  private _getTotalHeight(): number {
    return this._measureMessagesHeight(this._messages);
  }

  /**
   * Returns the offset relative to the top of the container
   * by a provided message index.
   *
   * @param idx
   * @returns
   */
  private _getOffsetByMsgIdx(idx: number): number {
    return this._measureMessagesHeight(this._messages.slice(0, idx));
  }

  /**
   * Returns the message index by a provided offset.
   *
   * @param offset
   * @returns
   */
  private _getMsgIdxByOffset(offset: number): number {
    let accumOffset = 0;

    for (let i = 0; i < this._messages.length; i++) {
      const msg = this._messages[i];
      if (msg) {
        const msgHeight = this._getMsgHeight(msg);
        accumOffset += msgHeight;

        if (accumOffset >= offset) {
          return i;
        }
      }
    }

    return 0;
  }

  /**
   * Measure messages height.
   *
   * @param messages
   * @returns
   */
  private _measureMessagesHeight(messages: DynamicItemInterface[]): number {
    return messages.map(m => this._getMsgHeight(m)).reduce((a, c) => a + c, 0);
  }

  /**
   * Determine the number of renderable messages
   * withing the viewport by given message index.
   *
   * @param startIdx
   * @returns
   */
  private _determineMessagesCountInViewport(startIdx: number): number {
    if (!this._viewport) {
      return 0;
    }

    let totalSize = 0;
    const viewportSize = this._viewport.getViewportSize();

    for (let i = startIdx; i < this._messages.length; i++) {
      const msg = this._messages[i];
      if (msg) {
        totalSize += this._getMsgHeight(msg);

        if (totalSize >= viewportSize) {
          return i - startIdx + 1;
        }
      }
    }

    return 0;
  }

  /**
   * Update the range of rendered messages.
   *
   * @returns
   */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset();
    const scrollIdx = this._getMsgIdxByOffset(scrollOffset);
    const dataLength = this._viewport.getDataLength();
    const renderedRange = this._viewport.getRenderedRange();
    const range = {
      start: renderedRange.start,
      end: renderedRange.end,
    };

    range.start = Math.max(0, scrollIdx - PaddingAbove);
    range.end = Math.min(
      dataLength,
      scrollIdx + this._determineMessagesCountInViewport(scrollIdx) + PaddingBelow
    );

    this._viewport.setRenderedRange(range);
    this._viewport.setRenderedContentOffset(this._getOffsetByMsgIdx(range.start));
    this._scrolledIndexChange$.next(scrollIdx);

    this._updateHeightCache();
  }

  /**
   * Get the height of a given message.
   * It could be either predicted or actual.
   * Results are memoized.
   *
   * @param m
   * @returns
   */
  private _getMsgHeight(m: DynamicItemInterface): number {
    let height = 0;
    const cachedHeight = this._heightCache.get(m.uuid);

    if (!cachedHeight) {
      height = this._predictor?.(m) ?? 0;
      this._heightCache.set(m.uuid, { value: height, source: 'predicted' });
    } else {
      height = cachedHeight.value;
    }

    return height;
  }

  /**
   * Update the height cache with the actual height
   * of the rendered message components.
   *
   * @returns
   */
  private _updateHeightCache() {
    if (!this._wrapper || !this._viewport) {
      return;
    }

    const nodes = this._wrapper.childNodes;
    let cacheUpdated = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;

      if (node && node.dataset && node.dataset['uuid']) {
        const uuid = node.dataset['uuid'];
        const cachedHeight = this._heightCache.get(uuid);
        if (!cachedHeight || cachedHeight.source !== 'actual') {
          const height = node.offsetHeight;
          this._heightCache.set(uuid, { value: height, source: 'actual' });
          node.dataset['height'] = JSON.stringify([cachedHeight?.value, height]);
          cacheUpdated = true;
        }
      }
    }

    if (cacheUpdated) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
    }
  }
}
