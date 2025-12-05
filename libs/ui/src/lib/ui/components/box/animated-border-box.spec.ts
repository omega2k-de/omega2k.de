import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimatedBorderBox } from './animated-border-box';

describe('AnimatedBorderBox', () => {
  let component: AnimatedBorderBox;
  let fixture: ComponentFixture<AnimatedBorderBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBorderBox],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedBorderBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
