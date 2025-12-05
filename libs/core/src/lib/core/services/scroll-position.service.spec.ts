import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import {
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  provideRouter,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
  RoutesRecognized,
  Scroll,
} from '@angular/router';
import { MockProvider } from 'ng-mocks';
import { Subject, Subscription } from 'rxjs';
import { ScrollPositionService } from './scroll-position.service';
import { provideConfig } from '../tokens';

describe('ScrollPositionService', () => {
  let service: ScrollPositionService;
  let viewport: ViewportScroller;

  const eventMockSubject = new Subject<
    | NavigationStart
    | NavigationEnd
    | NavigationCancel
    | NavigationError
    | RoutesRecognized
    | GuardsCheckStart
    | GuardsCheckEnd
    | RouteConfigLoadStart
    | RouteConfigLoadEnd
    | ChildActivationStart
    | ChildActivationEnd
    | ActivationStart
    | ActivationEnd
    | Scroll
    | ResolveStart
    | ResolveEnd
    | NavigationSkipped
  >();
  const routerMock: Partial<Router> = {
    events: eventMockSubject.asObservable(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideRouter([]),
        ViewportScroller,
        provideConfig({ logger: 'OFF' }),
        MockProvider(Router, routerMock),
      ],
    });
    viewport = TestBed.inject(ViewportScroller);
  });

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const setHistoryScrollRestorationSpy = vi.spyOn(viewport, 'setHistoryScrollRestoration');

    service = TestBed.inject(ScrollPositionService);
    service.enable();

    expect(service).toBeTruthy();
    expect(setHistoryScrollRestorationSpy).toHaveBeenCalledWith('manual');
    const unsubscribeSpy = vi.spyOn(service['routerSubscription'] as Subscription, 'unsubscribe');
    service.disable();

    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(scrollToSpy).toHaveBeenCalledTimes(0);

    setHistoryScrollRestorationSpy.mockRestore();
  });

  it('should scroll to position', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const scrollToPositionSpy = vi.spyOn(viewport, 'scrollToPosition');
    const routerEvent = new NavigationEnd(1, '/some/url', '/some/url');

    service = TestBed.inject(ScrollPositionService);
    service.enable();
    eventMockSubject.next(new Scroll(routerEvent, [0, 1337], null));

    expect(scrollToPositionSpy).toHaveBeenCalledWith([0, 1337]);
    expect(scrollToSpy).toHaveBeenCalledWith({
      left: 0,
      top: 1337,
    });

    scrollToSpy.mockRestore();
    scrollToPositionSpy.mockRestore();
  });

  it('should scroll to anchor', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const scrollToAnchorSpy = vi.spyOn(viewport, 'scrollToAnchor');
    const routerEvent = new NavigationEnd(1, '/some/url', '/some/url');

    service = TestBed.inject(ScrollPositionService);
    service.enable();
    eventMockSubject.next(new Scroll(routerEvent, null, 'some-anchor'));

    expect(scrollToAnchorSpy).toHaveBeenCalledWith('some-anchor');
    expect(scrollToSpy).toHaveBeenCalledTimes(0);

    scrollToSpy.mockRestore();
    scrollToAnchorSpy.mockRestore();
  });

  it('should scroll top on url change', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const scrollToPositionSpy = vi.spyOn(viewport, 'scrollToPosition');
    const routerEvent1 = new NavigationEnd(1, '/some/url', '/some/url');
    const routerEvent2 = new NavigationEnd(2, '/some/other/url', '/some/other/url');

    service = TestBed.inject(ScrollPositionService);
    service.enable();
    eventMockSubject.next(new Scroll(routerEvent1, null, 'some-anchor'));
    eventMockSubject.next(new Scroll(routerEvent2, null, null));

    expect(scrollToPositionSpy).toHaveBeenCalledWith([0, 0]);
    expect(scrollToSpy).toHaveBeenCalledTimes(2);
    expect(scrollToSpy).toHaveBeenNthCalledWith(1, { left: 0, top: 0 });
    expect(scrollToSpy).toHaveBeenNthCalledWith(2, { left: 0, top: 0, behavior: 'instant' });

    scrollToSpy.mockRestore();
    scrollToPositionSpy.mockRestore();
  });
});
