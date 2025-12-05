import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardsOutlet } from './cards.outlet';
import { MockComponents, MockDirectives, MockProvider } from 'ng-mocks';
import { CardsService } from '@o2k/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CardComponent, IconDirective, VibrateDirective } from '@o2k/ui';

describe('CardsOutlet', () => {
  let component: CardsOutlet;
  let fixture: ComponentFixture<CardsOutlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CardsOutlet,
        MockDirectives(VibrateDirective, IconDirective),
        MockComponents(CardComponent),
      ],
      providers: [
        provideRouter([]),
        MockProvider(CardsService, { loadBySlug: vi.fn().mockReturnValue(of([])) }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardsOutlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
