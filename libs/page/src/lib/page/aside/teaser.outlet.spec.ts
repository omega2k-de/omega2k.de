import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeaserOutlet } from './teaser.outlet';
import { provideRouter } from '@angular/router';

describe('TeaserOutlet', () => {
  let component: TeaserOutlet;
  let fixture: ComponentFixture<TeaserOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaserOutlet],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TeaserOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
