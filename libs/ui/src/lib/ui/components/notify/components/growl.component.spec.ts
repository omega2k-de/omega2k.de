import { ComponentFixture, TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';
import { GrowlComponent } from './growl.component';
import { MockComponents, MockDirectives } from 'ng-mocks';
import { IconDirective, ProgressRingDirective, VibrateDirective } from '../../../directives';
import { HealthRendererComponent } from '../renderer';

describe('GrowlComponent', () => {
  let component: GrowlComponent;
  let fixture: ComponentFixture<GrowlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GrowlComponent,
        MockDirectives(IconDirective, ProgressRingDirective, VibrateDirective),
        MockComponents(HealthRendererComponent),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GrowlComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', {
      id: 'id',
      date: dayjs(),
      message: 'message',
      title: 'title',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
