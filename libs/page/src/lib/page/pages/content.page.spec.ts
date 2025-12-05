import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentPage } from './content.page';
import { MockProvider } from 'ng-mocks';
import { ContentContextService } from '@o2k/core';
import { provideRouter } from '@angular/router';

describe('ContentPage', () => {
  let component: ContentPage;
  let fixture: ComponentFixture<ContentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPage],
      providers: [MockProvider(ContentContextService), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
