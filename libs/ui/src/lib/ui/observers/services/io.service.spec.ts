import { ElementRef, PLATFORM_ID, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, noop, Observable, Subject } from 'rxjs';
import { RootMarginFactory } from '../factories';
import { VpoObserveConfig } from '../interfaces/config.interface';
import {
  ObserverDebugHandleInterface,
  PooledObserver,
  PooledObserverKey,
} from '../interfaces/io.service.interface';
import { RootMarginModel } from '../models';
import { IoService } from './io.service';
import { VoService } from './vo.service';

describe('IoService', () => {
  let service: IoService;
  (window as unknown as { IntersectionObserver: unknown })['IntersectionObserver'] = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
  }));

  describe('IoService:server', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          IoService,
          RootMarginFactory,
          MockProvider(VoService),
          provideConfig({ logger: 'OFF' }),
          {
            provide: PLATFORM_ID,
            useValue: 'server',
          },
        ],
      });
      service = TestBed.inject(IoService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('#observe should return handle with debug', () => {
      const element = document.createElement('div');
      const handle = service.observe<ObserverDebugHandleInterface>(element, { debug: true });

      expect(Object.keys(handle)).toEqual([
        'key',
        'entries$',
        'config$',
        'update',
        'unobserve',
        'config',
        'refCount',
        'poolCount$',
        'rootMargin$',
        'pool',
      ]);
      expect(handle.poolCount$).toBeInstanceOf(Observable);
      expect(handle.rootMargin$).toBeInstanceOf(Observable);
      expect(handle.entries$).toBeInstanceOf(Observable);
      expect(handle.pool).toBeInstanceOf(Map<PooledObserverKey, PooledObserver>);
      expect(handle.key).toStrictEqual('SSR');
      expect(handle.refCount).toStrictEqual(0);
      expect(handle.update).toStrictEqual(noop);
      expect(handle.unobserve).toStrictEqual(noop);
    });

    it('#observe should return handle', () => {
      const element = document.createElement('div');
      const handle = service.observe<ObserverDebugHandleInterface>(element, {});
      const subj = new Subject<IntersectionObserverEntry>();
      subj.complete();

      expect(Object.keys(handle)).toEqual([
        'key',
        'entries$',
        'config$',
        'update',
        'unobserve',
        'config',
        'refCount',
      ]);
      expect(handle.entries$).toBeInstanceOf(Observable);
      expect(handle.update).toBeInstanceOf(Function);
      expect(handle.unobserve).toBeInstanceOf(Function);
      expect(handle.poolCount$).toStrictEqual(undefined);
      expect(handle.rootMargin$).toStrictEqual(undefined);
      expect(handle.pool).toStrictEqual(undefined);
      expect(handle).toEqual({
        config: null,
        key: 'SSR',
        refCount: 0,
        config$: subj.asObservable(),
        entries$: subj.asObservable(),
        update: noop,
        unobserve: noop,
      });
    });
  });

  describe('IoService:browser', () => {
    const tickSubject = new BehaviorSubject<number>(performance.now());

    afterEach(() => {
      vi.resetAllMocks();
    });

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          IoService,
          RootMarginFactory,
          MockProvider(VoService, {
            tick$: tickSubject.asObservable(),
          }),
          MockProvider(Renderer2),
          MockProvider(ElementRef),
          provideConfig({ logger: 'OFF' }),
          {
            provide: PLATFORM_ID,
            useValue: 'browser',
          },
        ],
      });
      service = TestBed.inject(IoService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('#observe with HTMLElement should return handle', () => {
      const getRootMarginModelSpy = vi
        .spyOn(service['rootMarginFactory'], 'create')
        .mockReturnValue(
          new RootMarginModel({
            angle: 0,
            orientation: 'portrait-primary',
            screenHeight: 0,
            screenWidth: 0,
            height: 0,
            innerHeight: 0,
            innerWidth: 0,
            offsetLeft: 0,
            offsetTop: 0,
            pageLeft: 0,
            pageTop: 0,
            scale: 0,
            width: 0,
          })
        );
      const element = document.createElement('div');
      const handle = service.observe(element, {});

      expect(Object.keys(handle)).toEqual([
        'key',
        'entries$',
        'config$',
        'update',
        'unobserve',
        'config',
        'refCount',
      ]);
      expect(getRootMarginModelSpy).toHaveBeenCalled();
    });

    it('#observe with VpoDebugComponent should return handle', () => {
      const getRootMarginModelSpy = vi
        .spyOn(service['rootMarginFactory'], 'create')
        .mockReturnValue(
          new RootMarginModel({
            angle: 0,
            orientation: 'portrait-primary',
            screenHeight: 0,
            screenWidth: 0,
            height: 0,
            innerHeight: 0,
            innerWidth: 0,
            offsetLeft: 0,
            offsetTop: 0,
            pageLeft: 0,
            pageTop: 0,
            scale: 0,
            width: 0,
          })
        );
      const element = document.createElement('div');
      const handle1 = service.observe<ObserverDebugHandleInterface>(element, {
        debug: true,
        extraMargins: {
          left: '-25px',
          right: 0,
          bottom: '-25%',
        },
      });
      const handle2 = service.observe<ObserverDebugHandleInterface>(element, {
        extraMargins: {
          left: '-25px',
          right: 0,
          bottom: '-25%',
        },
      });

      expect(Object.keys(handle1)).toEqual([
        'key',
        'entries$',
        'config$',
        'update',
        'unobserve',
        'config',
        'refCount',
        'pool',
        'rootMargin$',
        'poolCount$',
      ]);
      expect(Object.keys(handle2)).toEqual([
        'key',
        'entries$',
        'config$',
        'update',
        'unobserve',
        'config',
        'refCount',
      ]);
      expect(handle1.pool?.size).toStrictEqual(2);
      expect(handle2.pool?.size).toStrictEqual(undefined);
      expect(getRootMarginModelSpy).toHaveBeenCalled();
    });

    it('#updateConfig should update', () => {
      const getRootMarginModelSpy = vi
        .spyOn(service['rootMarginFactory'], 'create')
        .mockImplementation((_, extraMargins?: VpoObserveConfig['extraMargins']) => {
          return new RootMarginModel(
            {
              angle: 0,
              orientation: 'portrait-primary',
              screenHeight: 0,
              screenWidth: 0,
              scale: 1,
              offsetLeft: 0,
              offsetTop: 0,
              pageLeft: 0,
              pageTop: 138,
              width: 390,
              height: 844,
              innerWidth: 390,
              innerHeight: 844,
            },
            extraMargins
          );
        });
      const element = document.createElement('div');
      const handle = service.observe<ObserverDebugHandleInterface>(element, {
        debug: true,
        extraMargins: { left: '-25px', right: 0, bottom: '-25%' },
      });
      handle.update({ extraMargins: { right: '-50px', left: 0, bottom: '-50%' } });
      handle.update({ extraMargins: { right: '-15px', left: 42, top: '-10%' } });

      handle.unobserve();
      handle.unobserve();

      expect(getRootMarginModelSpy).toHaveBeenCalledTimes(1);
      expect(getRootMarginModelSpy).toHaveBeenNthCalledWith(1, null, {
        bottom: '-25%',
        left: '-25px',
        right: 0,
        top: 0,
      });
      expect(handle.pool?.size).toStrictEqual(0);
    });

    it('event$ should trigger update', () => {
      const getRootMarginModelSpy = vi
        .spyOn(service['rootMarginFactory'], 'create')
        .mockImplementation((_, extraMargins?: VpoObserveConfig['extraMargins']) => {
          return new RootMarginModel(
            {
              angle: 0,
              orientation: 'portrait-primary',
              screenHeight: 0,
              screenWidth: 0,
              scale: 1,
              offsetLeft: 0,
              offsetTop: 0,
              pageLeft: 0,
              pageTop: 138,
              width: 390,
              height: 844,
              innerWidth: 390,
              innerHeight: 844,
            },
            extraMargins
          );
        });
      const element = document.createElement('div');
      const handle = service.observe(element, {
        debug: true,
        extraMargins: { left: '-25px', right: 0, bottom: '-25%' },
      });
      tickSubject.next(performance.now());
      tickSubject.next(performance.now());
      handle.unobserve();

      expect(getRootMarginModelSpy).toHaveBeenCalledTimes(1);
      expect(getRootMarginModelSpy).toHaveBeenNthCalledWith(1, null, {
        bottom: '-25%',
        left: '-25px',
        right: 0,
        top: 0,
      });
    });
  });
});
