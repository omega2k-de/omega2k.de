import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideConfig } from '@o2k/core';
import { IconDirective, VersionComponent } from '@o2k/ui';
import { MockComponents, MockDirectives } from 'ng-mocks';
import { MainPage } from './main.page';
import { provideRouter } from '@angular/router';

describe('MainPage', () => {
  let component: MainPage;
  let fixture: ComponentFixture<MainPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPage, MockComponents(VersionComponent), MockDirectives(IconDirective)],
      providers: [provideConfig({ logger: 'OFF' }), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MainPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
