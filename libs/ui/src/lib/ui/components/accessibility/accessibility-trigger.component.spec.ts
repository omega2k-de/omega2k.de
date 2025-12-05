import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessibilityTriggerComponent } from './accessibility-trigger.component';
import { MockDirectives } from 'ng-mocks';
import { AutoIdDirective, IconDirective, VibrateDirective } from '../../directives';

describe('AccessibilityTriggerComponent', () => {
  let component: AccessibilityTriggerComponent;
  let fixture: ComponentFixture<AccessibilityTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AccessibilityTriggerComponent,
        MockDirectives(AutoIdDirective, VibrateDirective, IconDirective),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessibilityTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
