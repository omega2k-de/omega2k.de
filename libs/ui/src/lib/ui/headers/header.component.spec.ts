import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { MockProvider } from 'ng-mocks';
import {
  CoordinatorService,
  LocalStorageService,
  NavigationService,
  NotificationService,
  PageRecordTree,
  provideConfig,
  ScrollProgressService,
} from '@o2k/core';
import { ViewportScroller } from '@angular/common';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    const tree: PageRecordTree = {
      children: [],
      page: {
        id: 0,
        slug: '',
        parent: null,
        topic: null,
        route: '',
        title: '',
        keywords: '',
        description: null,
        authorSlug: null,
        layout: null,
        version: 0,
        readingTimeMin: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        ogImageWidth: null,
        ogImageHeight: null,
        createdAt: null,
        updatedAt: null,
        isPublished: false,
        isNew: false,
      },
      parent: null,
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideRouter([]),
        MockProvider(NavigationService, {
          loadByLocation: vi.fn().mockReturnValue(of([])),
          tree: vi.fn().mockReturnValue(of(tree)),
        }),
        MockProvider(LocalStorageService, {
          save: vi.fn(),
          get: vi.fn().mockReturnValue(null),
        }),
        MockProvider(NotificationService, {
          localNotificationsEnabled: signal(false),
          toggleNotifications: vi.fn(),
          notifications$: of([]),
        }),
        MockProvider(CoordinatorService, {
          toggleNotificationOverlay: vi.fn(),
          isNavigationOpen: signal<boolean>(false),
          isNotificationOpen: signal<boolean>(false),
          showBackdrop: signal<boolean>(false),
          isAsideOpen: signal<boolean>(false),
        }),
        MockProvider(ScrollProgressService, {
          progress$: of(0),
        }),
        MockProvider(ViewportScroller, {
          setOffset: vi.fn(),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
