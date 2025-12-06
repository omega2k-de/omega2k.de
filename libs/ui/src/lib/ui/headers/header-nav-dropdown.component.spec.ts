import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderNavDropdownComponent } from './header-nav-dropdown.component';
import { CoordinatorService, NavigationService, provideConfig } from '@o2k/core';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('HeaderNavDropdownComponent', () => {
  let component: HeaderNavDropdownComponent;
  let fixture: ComponentFixture<HeaderNavDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNavDropdownComponent],
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideRouter([]),
        MockProvider(CoordinatorService, {
          isNavigationOpen: signal<boolean>(false),
          isNotificationOpen: signal<boolean>(false),
          showBackdrop: signal<boolean>(false),
          isAsideOpen: signal<boolean>(false),
        }),
        MockProvider(NavigationService, {
          loadByLocation: vi.fn().mockReturnValueOnce(of([])),
          tree: vi.fn().mockReturnValueOnce(of({ parent: null })),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNavDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
