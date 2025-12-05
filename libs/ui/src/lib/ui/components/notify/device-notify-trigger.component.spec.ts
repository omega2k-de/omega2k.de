import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceNotifyTriggerComponent } from './device-notify-trigger.component';
import { MockDirectives, MockProvider } from 'ng-mocks';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../directives';
import { DeviceNotifyService } from '@o2k/core';
import { BehaviorSubject } from 'rxjs';

describe('DeviceNotifyTriggerComponent', () => {
  let component: DeviceNotifyTriggerComponent;
  let fixture: ComponentFixture<DeviceNotifyTriggerComponent>;
  const enabledSubject = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DeviceNotifyTriggerComponent,
        MockDirectives(AutoIdDirective, VibrateDirective, IconDirective),
      ],
      providers: [
        MockProvider(DeviceNotifyService, {
          enabled$: enabledSubject.asObservable(),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceNotifyTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
