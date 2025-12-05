import { TestBed } from '@angular/core/testing';

import { PerfService } from './perf.service';

describe('PerfService', () => {
  let service: PerfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#start should be start', () => {
    const fn = () => {
      return;
    };

    service.start(fn);
    const result = service.performance(fn);

    expect(result?.method).toStrictEqual(`() => {
      return;
    }`);
    expect(result?.sequence).toHaveLength(0);
    expect(result?.start).toBeGreaterThan(0);
  });

  it('#stop should measure', () => {
    const fn = () => {
      return;
    };
    service.start(fn);
    service.stop(fn);
    const result = service.performance(fn);

    expect(result?.method).toStrictEqual(`() => {
      return;
    }`);
    expect(result?.sequence).toHaveLength(1);
    expect(result?.avg).toBeGreaterThan(0);
    expect(result?.start).toBeGreaterThan(0);
    expect(result?.stop).toBeGreaterThan(0);
  });

  it('#summary should return all', () => {
    const fn1 = () => {
      return;
    };
    const fn2 = () => {
      return;
    };
    service.start(fn1);
    service.start(fn2);
    service.stop(fn2);
    service.stop(fn1);
    const result = service.summary();

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(2);
    expect(result?.[0]?.method).toStrictEqual(`() => {
      return;
    }`);
    expect(result?.[1]?.method).toStrictEqual(`() => {
      return;
    }`);
  });

  it('#summary should return empty', () => {
    const fn1 = () => {
      return;
    };
    service.start(fn1);
    const result = service.summary();

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
    expect(result?.[0]?.avg).toStrictEqual(0);
    expect(result?.[0]?.method).toStrictEqual(`() => {
      return;
    }`);
  });

  it('#stop should truncate sequence', () => {
    const fn1 = () => {
      return;
    };
    service.start(fn1);
    for (let i = 0; i < 2000; i++) {
      service.start(fn1);
      service.stop(fn1);
    }
    const result = service.summary();

    expect(result?.[0]?.avg).toBeGreaterThan(0);
    expect(result?.[0]?.sequence).toHaveLength(1000);
    expect(result?.[0]?.method).toStrictEqual(`() => {
      return;
    }`);
  });
});
