import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShootingStars } from './shooting-stars';

describe('ShootingStars', () => {
  let component: ShootingStars;
  let fixture: ComponentFixture<ShootingStars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShootingStars],
    }).compileComponents();

    fixture = TestBed.createComponent(ShootingStars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
