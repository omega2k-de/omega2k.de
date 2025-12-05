import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimatedBackdropComponent } from './animated-backdrop.component';

describe('AnimatedBackdropComponent', () => {
  let component: AnimatedBackdropComponent;
  let fixture: ComponentFixture<AnimatedBackdropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBackdropComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedBackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
