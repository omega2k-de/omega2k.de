import { TestBed } from '@angular/core/testing';
import { RootMarginViewport } from '../interfaces/root-margin.interface';
import { RootMarginModel } from '../models';
import { RootMarginFactory } from './root-margin.factory';

describe('RootMarginFactory', () => {
  let service: RootMarginFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RootMarginFactory);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#create should return valid instance', () => {
    const viewBox: RootMarginViewport = {
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 29,
      width: 390,
      height: 844,
      innerWidth: 390,
      innerHeight: 844,
      angle: 0,
      orientation: 'portrait-primary',
      screenWidth: 390,
      screenHeight: 844,
    };
    const model = new RootMarginModel(viewBox, {}, 5);
    vi.spyOn(service, 'viewBox').mockReturnValue(viewBox);

    const result = service.create(null, {}, 5);

    expect(result.top).toStrictEqual(model.top);
    expect(result.bottom).toStrictEqual(model.bottom);
    expect(result.left).toStrictEqual(model.left);
    expect(result.right).toStrictEqual(model.right);
    expect(result.scale).toStrictEqual(model.scale);
    expect(result.toString()).toStrictEqual(model.toString());
    expect(result.toObject()).toStrictEqual(model.toObject());
    expect(result.margins(2)).toStrictEqual(model.margins(2));
  });

  it('#viewBox getter should return', () => {
    const viewBox = service.viewBox();
    expect(viewBox).toStrictEqual({
      angle: 0,
      height: 0,
      innerHeight: 768,
      innerWidth: 1024,
      offsetLeft: 0,
      offsetTop: 0,
      orientation: 'portrait-primary',
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      screenHeight: 0,
      screenWidth: 0,
      width: 0,
    });
  });
});
