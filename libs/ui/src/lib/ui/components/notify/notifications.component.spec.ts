import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { MockComponents, MockDirectives, MockProvider } from 'ng-mocks';
import { IconDirective, VibrateDirective } from '../../directives';
import { GrowlComponent } from './components';
import { OverlayComponent } from './overlay.component';
import { NotificationService, NotificationTypes } from '@o2k/core';
import { BehaviorSubject } from 'rxjs';

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

  it('#ngOnDestroy should clear map', () => {
    component['toggleMinimize']();
    expect(component['minimized']()).toStrictEqual(false);
    component['toggleMinimize']();
    expect(component['minimized']()).toStrictEqual(true);
    component['toggleMinimize']();
    expect(component['minimized']()).toStrictEqual(false);
    component['toggleMinimize']();
    expect(component['minimized']()).toStrictEqual(true);
  });
});
