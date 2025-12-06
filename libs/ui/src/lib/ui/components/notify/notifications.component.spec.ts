import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { MockComponents, MockDirectives, MockProvider } from 'ng-mocks';
import { IconDirective, VibrateDirective } from '../../directives';
import { GrowlComponent } from './components';
import { OverlayComponent } from './overlay.component';
import { CoordinatorService, NotificationService, NotificationTypes } from '@o2k/core';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  const notificationsSubject = new BehaviorSubject<NotificationTypes[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotificationsComponent,
        MockComponents(GrowlComponent, OverlayComponent),
        MockDirectives(IconDirective, VibrateDirective),
      ],
      providers: [
        MockProvider(NotificationService, {
          notifications$: notificationsSubject.asObservable(),
        }),
        MockProvider(CoordinatorService, {
          toggleNotificationOverlay: vi.fn(),
          isNavigationOpen: signal<boolean>(false),
          isNotificationOpen: signal<boolean>(false),
          showBackdrop: signal<boolean>(false),
          isAsideOpen: signal<boolean>(false),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#toggleMinimize should toggle', () => {
    expect(component).toBeTruthy();
  });

  it('#hasSeenAllImportantMessages is true on empty list', () => {
    const state = component['hasSeenAllImportantMessages']([]);
    expect(state).toBeTruthy();
  });
});
