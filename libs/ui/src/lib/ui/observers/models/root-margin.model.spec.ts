import { TestBed } from '@angular/core/testing';
import {
  PercentPx,
  RootMarginsInterface,
  RootMarginToPixViewbox,
  RootMarginViewport,
  VpoObserveConfig,
} from '../interfaces';
import { RootMarginModel } from './root-margin.model';

describe('RootMarginModel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const toStringData: {
    viewBox: RootMarginViewport;
    extraMargins?: VpoObserveConfig['extraMargins'];
    precision?: number;
    expected: string;
  }[] = [
    {
      viewBox: {
        width: 0,
        innerWidth: 0,
        height: 0,
        innerHeight: 0,
        offsetLeft: 0,
        offsetTop: 0,
        scale: 0,
        pageTop: 0,
        pageLeft: 0,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: '0px 0px 0px 0px',
    },
    {
      viewBox: {
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 138,
        width: 390,
        height: 844,
        innerWidth: 390,
        innerHeight: 844,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: '0px 0px 0px 0px',
    },
    {
      viewBox: {
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 138,
        width: 390,
        height: 844,
        innerWidth: 390,
        innerHeight: 844,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      extraMargins: {
        top: '-25px',
        left: 0,
        bottom: '-50%',
      },
      expected: '-25px 0px -422px 0px',
    },
  ];

  it.each(toStringData)(
    '#toString should transform $extraMargins to $expected',
    ({
      viewBox,
      extraMargins,
      precision,
      expected,
    }: {
      viewBox: RootMarginViewport;
      extraMargins?: VpoObserveConfig['extraMargins'];
      precision?: number;
      expected: string;
    }) => {
      const model = new RootMarginModel(viewBox, extraMargins, precision);
      expect(model.toString()).toStrictEqual(expected);
    }
  );

  const toObjectData: {
    viewBox: RootMarginViewport;
    extraMargins?: VpoObserveConfig['extraMargins'];
    precision?: number;
    expected: RootMarginsInterface;
  }[] = [
    {
      viewBox: {
        width: 0,
        innerWidth: 0,
        height: 0,
        innerHeight: 0,
        offsetLeft: 0,
        offsetTop: 0,
        scale: 0,
        pageTop: 0,
        pageLeft: 0,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: {
        bottom: 0,
        left: 0,
        height: 0,
        width: 0,
        right: 0,
        scale: 0,
        top: 0,
      },
    },
    {
      viewBox: {
        scale: 1.503,
        offsetLeft: 129,
        offsetTop: 202,
        pageLeft: 129,
        pageTop: 202,
        width: 259.341,
        height: 561.242,
        innerWidth: 390,
        innerHeight: 844,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: {
        bottom: -361.379,
        left: -129,
        height: 561.242,
        width: 259.341,
        right: -1.659,
        scale: 1.503,
        top: -218.633,
      },
      extraMargins: {
        top: '-25px',
        left: 0,
        bottom: '-50%',
      },
    },
    {
      viewBox: {
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 0,
        width: 1024,
        height: 768,
        innerWidth: 1024,
        innerHeight: 768,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: {
        bottom: -384,
        left: 0,
        height: 768,
        width: 1024,
        right: 0,
        scale: 1,
        top: -25,
      },
      extraMargins: {
        top: '-25px',
        left: 0,
        bottom: '-50%',
      },
    },
  ];

  it.each(toObjectData)(
    '#toString should transform $viewBox with $extraMargins to $expected',
    ({
      viewBox,
      extraMargins,
      precision,
      expected,
    }: {
      viewBox: RootMarginViewport;
      extraMargins?: VpoObserveConfig['extraMargins'];
      precision?: number;
      expected: RootMarginsInterface;
    }) => {
      const model = new RootMarginModel(viewBox, extraMargins, precision);
      expect(model.toObject(3)).toStrictEqual(expected);
    }
  );

  const toPxData: {
    side: 'top' | 'bottom' | 'left' | 'right';
    input?: PercentPx;
    viewBox?: RootMarginToPixViewbox;
    expected: number;
  }[] = [
    {
      side: 'top',
      expected: 0,
    },
    {
      side: 'top',
      input: '-42',
      expected: -42,
    },
    {
      side: 'top',
      input: '+1337px',
      expected: 1337,
    },
    {
      side: 'top',
      input: '-50%',
      viewBox: {
        width: 2000,
        height: 1000,
        scale: 1,
      },
      expected: -500,
    },
    {
      side: 'left',
      input: '25%',
      viewBox: {
        width: 1000,
        height: 2000,
        scale: 1,
      },
      expected: 250,
    },
    {
      side: 'left',
      input: '-16px',
      expected: -16,
    },
  ];

  it.each(toPxData)(
    '#toPx should transform $input for $side and return $expected',
    ({
      side,
      input,
      viewBox,
      expected,
    }: {
      side: 'top' | 'bottom' | 'left' | 'right';
      input?: PercentPx;
      viewBox?: RootMarginToPixViewbox;
      expected: number;
    }) => {
      const model = new RootMarginModel({
        angle: 0,
        orientation: 'landscape-primary',
        screenHeight: 0,
        screenWidth: 0,
        pageLeft: 0,
        pageTop: 0,
        scale: 1,
        height: 0,
        innerHeight: 0,
        innerWidth: 0,
        offsetLeft: 0,
        offsetTop: 0,
        width: 0,
      });
      expect(model.toPx(side, input, viewBox)).toStrictEqual(expected);
    }
  );

  const marginsData: {
    viewBox: RootMarginViewport;
    extraMargins?: VpoObserveConfig['extraMargins'];
    precision?: number;
    expected: RootMarginsInterface;
  }[] = [
    {
      viewBox: {
        width: 0,
        innerWidth: 0,
        height: 0,
        innerHeight: 0,
        offsetLeft: 0,
        offsetTop: 0,
        scale: 0,
        pageTop: 0,
        pageLeft: 0,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    {
      viewBox: {
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 138,
        width: 390,
        height: 844,
        innerWidth: 390,
        innerHeight: 844,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      expected: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    {
      viewBox: {
        scale: 1,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 138,
        width: 390,
        height: 844,
        innerWidth: 390,
        innerHeight: 844,
        angle: 0,
        orientation: 'landscape-primary',
        screenWidth: 0,
        screenHeight: 0,
      },
      extraMargins: {
        top: '-25px',
        left: 0,
        bottom: '-50%',
      },
      expected: {
        bottom: 422,
        left: 0,
        right: 0,
        top: 25,
      },
    },
  ];

  it.each(marginsData)(
    '#margin should transform $extraMargins to $expected',
    ({
      viewBox,
      extraMargins,
      precision,
      expected,
    }: {
      viewBox: RootMarginViewport;
      extraMargins?: VpoObserveConfig['extraMargins'];
      precision?: number;
      expected: RootMarginsInterface;
    }) => {
      const model = new RootMarginModel(viewBox, extraMargins, precision);
      expect(model.margins()).toStrictEqual(expected);
    }
  );

  it('#viewBox get should return active viewBox ', () => {
    const viewBox = <RootMarginViewport>{
      width: 1024,
    };
    const model = new RootMarginModel(viewBox, {}, 0);
    expect(model.viewBox).toStrictEqual(viewBox);
  });
});
