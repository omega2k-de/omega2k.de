import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RippleComponent } from './ripple.component';

describe('RippleComponent', () => {
  let component: RippleComponent;
  let fixture: ComponentFixture<RippleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RippleComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(RippleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
