import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderNavComponent } from './header-nav.component';
import { MockDirectives, MockProvider } from 'ng-mocks';
import { NavigationService } from '@o2k/core';
import { of } from 'rxjs';
import { RouterLinkDirective } from '../directives';
import { RouterLinkActive } from '@angular/router';

describe('HeaderNavComponent', () => {
  let component: HeaderNavComponent;
  let fixture: ComponentFixture<HeaderNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNavComponent, MockDirectives(RouterLinkDirective, RouterLinkActive)],
      providers: [
        MockProvider(NavigationService, {
          loadByLocation: vi.fn().mockReturnValueOnce(of([])),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
