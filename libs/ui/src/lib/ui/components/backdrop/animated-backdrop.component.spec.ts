import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimatedBackdropComponent } from './animated-backdrop.component';
import { MockProvider } from 'ng-mocks';
import { CoordinatorService } from '@o2k/core';
import { signal } from '@angular/core';

describe('AnimatedBackdropComponent', () => {
  let component: AnimatedBackdropComponent;
  let fixture: ComponentFixture<AnimatedBackdropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBackdropComponent],
      providers: [
        MockProvider(CoordinatorService, {
          showBackdrop: signal(true),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimatedBackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
