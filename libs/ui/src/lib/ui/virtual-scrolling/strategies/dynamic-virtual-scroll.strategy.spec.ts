import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  DYNAMIC_HEIGHT_PREDICTOR,
  DynamicVirtualScrollStrategy,
} from './dynamic-virtual-scroll.strategy';
import { DynamicItemInterface } from '../interfaces';

type TestItem = DynamicItemInterface & { height: number };

const createItems = (heights: number[]): TestItem[] =>
  heights.map((height, idx) => ({ uuid: `uuid-${idx}`, height }));

class MockViewport {
  renderedRange: ListRange = { start: 0, end: 0 };
  totalContentSize = 0;
  contentOffset = 0;
  scrollOffset = 0;
  dataLength = 0;
  lastScrollBehavior: ScrollBehavior | null = null;
  readonly checkViewportSize = vi.fn();

  private readonly host: HTMLElement;
  private readonly wrapper: HTMLElement;

  constructor(private viewportSize = 50) {
    this.host = document.createElement('div');
    this.wrapper = document.createElement('div');
    this.host.append(this.wrapper);
  }

  asViewport(): CdkVirtualScrollViewport {
    return this as unknown as CdkVirtualScrollViewport;
  }

  getElementRef(): ElementRef<HTMLElement> {
    return { nativeElement: this.host } as ElementRef<HTMLElement>;
  }

  setRenderedRange(range: ListRange) {
    this.renderedRange = { ...range };
  }

  getRenderedRange(): ListRange {
    return this.renderedRange;
  }

  setRenderedContentOffset(offset: number) {
    this.contentOffset = offset;
  }

  measureScrollOffset(): number {
    return this.scrollOffset;
  }

  setScrollOffset(offset: number) {
    this.scrollOffset = offset;
  }

  setTotalContentSize(size: number) {
    this.totalContentSize = size;
  }

  getViewportSize(): number {
    return this.viewportSize;
  }

  setViewportSize(size: number) {
    this.viewportSize = size;
  }

  scrollToOffset(offset: number, behavior: ScrollBehavior = 'auto') {
    this.scrollOffset = offset;
    this.lastScrollBehavior = behavior;
  }

  setRenderedNodes(nodes: Array<{ uuid: string; height: number }>) {
    while (this.wrapper.firstChild) {
      this.wrapper.removeChild(this.wrapper.firstChild);
    }

    nodes.forEach(({ uuid, height }) => {
      const element = document.createElement('div');
      element.dataset['uuid'] = uuid;
      Object.defineProperty(element, 'offsetHeight', {
        configurable: true,
        value: height,
      });
      this.wrapper.appendChild(element);
    });
  }

  getNodeHeights() {
    return Array.from(this.wrapper.childNodes).map(node => {
      const element = node as HTMLElement;
      return {
        uuid: element.dataset?.['uuid'] ?? '',
        value: element.dataset?.['height'],
      };
    });
  }

  setDataLength(length: number) {
    this.dataLength = length;
  }

  getDataLength(): number {
    return this.dataLength;
  }
}

describe('DynamicVirtualScrollStrategy', () => {
  let strategy: DynamicVirtualScrollStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DynamicVirtualScrollStrategy,
        {
          provide: DYNAMIC_HEIGHT_PREDICTOR,
          useValue: (item: TestItem) => item.height,
        },
      ],
    });

    strategy = TestBed.inject(DynamicVirtualScrollStrategy);
  });

  it('should compute total height and rendered range on attach', () => {
    const items = createItems([20, 15, 30, 25, 10]);
    const viewport = new MockViewport(60);
    viewport.setDataLength(items.length);

    strategy.updateMessages(items);
    strategy.attach(viewport.asViewport());

    expect(viewport.totalContentSize).toStrictEqual(100);
    expect(viewport.renderedRange).toStrictEqual({ start: 0, end: 5 });
    expect(viewport.contentOffset).toStrictEqual(0);
  });

  it('should update viewport when scrolled and emit the current index', () => {
    const items = createItems(new Array(10).fill(0).map(() => 10));
    const viewport = new MockViewport(30);
    viewport.setDataLength(items.length);
    const emissions: number[] = [];
    const subscription = strategy.scrolledIndexChange.subscribe(value => emissions.push(value));

    strategy.updateMessages(items);
    strategy.attach(viewport.asViewport());
    viewport.setScrollOffset(90);
    strategy.onContentScrolled();

    expect(viewport.renderedRange).toStrictEqual({ start: 3, end: 10 });
    expect(viewport.contentOffset).toStrictEqual(30);
    expect(emissions.at(-1)).toStrictEqual(8);
    subscription.unsubscribe();
  });

  it('should update cached heights with actual DOM measurements', () => {
    const items = createItems([20, 20]);
    const viewport = new MockViewport(50);
    viewport.setDataLength(items.length);

    strategy.updateMessages(items);
    strategy.attach(viewport.asViewport());
    viewport.setRenderedNodes([
      { uuid: items[0]?.uuid ?? '', height: 30 },
      { uuid: items[1]?.uuid ?? '', height: 40 },
    ]);
    strategy.onContentScrolled();

    expect(viewport.totalContentSize).toStrictEqual(70);
    expect(viewport.getNodeHeights()).toContainEqual({
      uuid: items[0]?.uuid ?? '',
      value: '[20,30]',
    });
    expect(viewport.getNodeHeights()).toContainEqual({
      uuid: items[1]?.uuid ?? '',
      value: '[20,40]',
    });
  });

  it('should re-check the viewport when new messages arrive', () => {
    const items = createItems([15, 10, 12]);
    const viewport = new MockViewport();
    viewport.setDataLength(items.length);

    strategy.attach(viewport.asViewport());
    strategy.updateMessages(items);

    expect(viewport.checkViewportSize).toHaveBeenCalled();
  });

  it('should scroll to a specific index based on predicted heights', () => {
    const items = createItems([12, 18, 24, 6]);
    const viewport = new MockViewport();
    viewport.setDataLength(items.length);

    strategy.updateMessages(items);
    strategy.attach(viewport.asViewport());
    strategy.scrollToIndex(3, 'smooth');

    expect(viewport.scrollOffset).toStrictEqual(54);
    expect(viewport.lastScrollBehavior).toStrictEqual('smooth');
  });
});
