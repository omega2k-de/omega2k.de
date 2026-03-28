import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';

import { VoService } from './vo.service';

describe('VoService', () => {
  const matchingCalls = (calls: unknown[][], type: string, handler: VoidFunction) =>
    calls.filter(call => call[0] === type && call[1] === handler);

  describe('VoService:browser', () => {
    let service: VoService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideConfig({ logger: 'OFF' }),
          {
            provide: PLATFORM_ID,
            useValue: 'browser',
          },
        ],
      });
      service = TestBed.inject(VoService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('#observe should start listening changes with root: null', () => {
      const windowSpy = vi.spyOn(window, 'addEventListener');
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      window['visualViewport'] = {
        addEventListener,
        removeEventListener,
      } as unknown as VisualViewport;

      // act
      service.observe(null);

      // assert
      expect(matchingCalls(windowSpy.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(windowSpy.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
      expect(
        matchingCalls(windowSpy.mock.calls, 'orientationchange', service['tick'])
      ).toHaveLength(1);
      expect(matchingCalls(addEventListener.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(addEventListener.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
    });

    it('#unobserve should stop listening changes with root: null', () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      window['visualViewport'] = {
        addEventListener,
        removeEventListener,
      } as unknown as VisualViewport;
      service.observe(null);
      const windowSpy = vi.spyOn(window, 'removeEventListener');

      // act
      service.unobserve(null);

      // assert
      expect(matchingCalls(windowSpy.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(windowSpy.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
      expect(
        matchingCalls(windowSpy.mock.calls, 'orientationchange', service['tick'])
      ).toHaveLength(1);
      expect(matchingCalls(removeEventListener.mock.calls, 'resize', service['tick'])).toHaveLength(
        1
      );
      expect(matchingCalls(removeEventListener.mock.calls, 'scroll', service['tick'])).toHaveLength(
        1
      );
    });

    it('#observe should start listening changes with html element as root', () => {
      const element = document.createElement('div');
      const elementSpy = vi.spyOn(element, 'addEventListener');
      const windowSpy = vi.spyOn(window, 'addEventListener');
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      window['visualViewport'] = {
        addEventListener,
        removeEventListener,
      } as unknown as VisualViewport;

      // act
      service.observe(element);

      // assert
      expect(matchingCalls(elementSpy.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(elementSpy.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
      expect(matchingCalls(windowSpy.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(windowSpy.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
      expect(
        matchingCalls(windowSpy.mock.calls, 'orientationchange', service['tick'])
      ).toHaveLength(1);
      expect(matchingCalls(addEventListener.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(addEventListener.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
    });

    it('#unobserve should stop listening changes with html element as root', () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      const element = document.createElement('div');
      window['visualViewport'] = {
        addEventListener,
        removeEventListener,
      } as unknown as VisualViewport;
      service.observe(element);
      const elementSpy = vi.spyOn(element, 'removeEventListener');
      const windowSpy = vi.spyOn(window, 'removeEventListener');

      // act
      service.unobserve(element);

      // assert
      expect(matchingCalls(elementSpy.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(elementSpy.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
      expect(matchingCalls(windowSpy.mock.calls, 'resize', service['tick'])).toHaveLength(1);
      expect(matchingCalls(windowSpy.mock.calls, 'scroll', service['tick'])).toHaveLength(1);
      expect(
        matchingCalls(windowSpy.mock.calls, 'orientationchange', service['tick'])
      ).toHaveLength(1);
      expect(matchingCalls(removeEventListener.mock.calls, 'resize', service['tick'])).toHaveLength(
        1
      );
      expect(matchingCalls(removeEventListener.mock.calls, 'scroll', service['tick'])).toHaveLength(
        1
      );
    });
  });

  describe('VoService:server', () => {
    let service: VoService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideConfig({ logger: 'OFF' }),
          {
            provide: PLATFORM_ID,
            useValue: 'server',
          },
        ],
      });
      service = TestBed.inject(VoService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('#observe should ignore ssr', () => {
      const loggerSpy = vi.spyOn(service['logger'], 'warn');

      service.observe(null);

      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenLastCalledWith('VoService', 'observe', 'SSR');
    });

    it('#unobserve should ignore ssr', () => {
      const loggerSpy = vi.spyOn(service['logger'], 'warn');

      service.unobserve(null);

      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenLastCalledWith('VoService', 'unobserve', 'SSR');
    });
  });
});
