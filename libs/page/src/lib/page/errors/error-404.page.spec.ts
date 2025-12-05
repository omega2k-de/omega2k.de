import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Error404Page } from './error-404.page';
import { MockComponents } from 'ng-mocks';
import { VersionComponent } from '@o2k/ui';

describe('Error404Page', () => {
  let component: Error404Page;
  let fixture: ComponentFixture<Error404Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Error404Page, MockComponents(VersionComponent)],
    }).compileComponents();

    fixture = TestBed.createComponent(Error404Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
