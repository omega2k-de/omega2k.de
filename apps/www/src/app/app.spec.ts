import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
import {
  CoordinatorService,
  LocalStorageService,
  NavigationService,
  NotificationService,
  NotificationTypes,
  PlatformService,
  provideConfig,
  ScrollProgressService,
} from '@o2k/core';
import {
  GooComponent,
  HeaderNavComponent,
  HeaderNavDropdownComponent,
  IconDirective,
  NotificationsComponent,
  VibrateDirective,
} from '@o2k/ui';
import { MockComponents, MockDirectives, MockProvider } from 'ng-mocks';
import { App } from './app';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NgOptimizedImage, ViewportScroller } from '@angular/common';
import { signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  const scrollProgressSubject = new Subject<number>();
  const notificationsSubject = new BehaviorSubject<NotificationTypes[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        MockComponents(
          HeaderNavComponent,
          HeaderNavDropdownComponent,
          GooComponent,
          NotificationsComponent
        ),
        MockDirectives(IconDirective, VibrateDirective, NgOptimizedImage, RouterOutlet),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideConfig({ logger: 'OFF' }),
        NavigationService,
        MockProvider(PlatformService, {
          get isBrowser() {
            return true;
          },
        }),
        MockProvider(ScrollProgressService, {
          progress$: scrollProgressSubject.asObservable(),
        }),
        MockProvider(NotificationService, {
          localNotificationsEnabled: signal<boolean>(true),
          notifications$: notificationsSubject.asObservable(),
        }),
        MockProvider(LocalStorageService),
        MockProvider(CoordinatorService, {
          isNavigationOpen: signal<boolean>(false),
          isNotificationOpen: signal<boolean>(false),
          showBackdrop: signal<boolean>(false),
          isAsideOpen: signal<boolean>(false),
        }),
        MockProvider(ViewportScroller, {
          setOffset: vi.fn(),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
