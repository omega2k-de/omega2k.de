import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlsPage } from './controls.page';
import { MockDirectives, MockProvider } from 'ng-mocks';
import { CardsService, LikesService, provideConfig, ReadingProgressStorage } from '@o2k/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { IconDirective, ReadingProgressDirective } from '@o2k/ui';

describe('ControlsPage', () => {
  let component: ControlsPage;
  let fixture: ComponentFixture<ControlsPage>;
  let cardsServiceMock: Partial<CardsService>;
  let likesServiceMock: Partial<LikesService>;

  beforeEach(async () => {
    cardsServiceMock = {
      loadAll: vi.fn().mockReturnValueOnce(of([])),
    };
    likesServiceMock = {
      getAllStates: vi.fn().mockReturnValueOnce(of([])),
    };
    await TestBed.configureTestingModule({
      imports: [ControlsPage, MockDirectives(ReadingProgressDirective, IconDirective)],
      providers: [
        provideRouter([]),
        provideConfig({ logger: 'OFF' }),
        MockProvider(CardsService, cardsServiceMock),
        MockProvider(LikesService, likesServiceMock),
        MockProvider(ReadingProgressStorage),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#resetProgressImmediate should reset progress', () => {
    const resetSpy = vi.spyOn(component['progressStorage'], 'resetProgressImmediate');
    component.resetProgressImmediate(42);

    expect(resetSpy).toHaveBeenCalledOnce();
    expect(resetSpy).toHaveBeenCalledWith(42);
  });
});
