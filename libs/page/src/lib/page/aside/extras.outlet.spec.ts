import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtrasOutlet } from './extras.outlet';

describe('ExtrasOutlet', () => {
  let component: ExtrasOutlet;
  let fixture: ComponentFixture<ExtrasOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtrasOutlet],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtrasOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
