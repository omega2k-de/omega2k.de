import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarOutlet } from './avatar.outlet';

describe('AvatarOutlet', () => {
  let component: AvatarOutlet;
  let fixture: ComponentFixture<AvatarOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarOutlet],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
