import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyPage } from './privacy.page';
import { provideRouter } from '@angular/router';
import { MockDirectives, MockProviders } from 'ng-mocks';
import { IconDirective } from '@o2k/ui';
import { PrivacyService } from '@o2k/core';
import { of } from 'rxjs';

describe('PrivacyPage', () => {
  let component: PrivacyPage;
  let fixture: ComponentFixture<PrivacyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPage, MockDirectives(IconDirective)],
      providers: [provideRouter([]), MockProviders(PrivacyService)],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#load should call service', () => {
    const cookiesSpy = vi.spyOn(component['privacyService'], 'cookies').mockReturnValueOnce(of([]));

    component.load();

    expect(cookiesSpy).toHaveBeenCalledOnce();
  });
});
