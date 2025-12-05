import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { PageRecordInterface } from '@o2k/core';
import { provideRouter, RouterLink, RouterLinkActive } from '@angular/router';
import { MockDirectives } from 'ng-mocks';
import { IconDirective, ReadingProgressDirective, RouterLinkDirective } from '../../directives';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CardComponent,
        MockDirectives(
          IconDirective,
          RouterLinkActive,
          ReadingProgressDirective,
          RouterLinkDirective,
          RouterLink
        ),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('card', <PageRecordInterface>{
      id: '1337',
      route: '/some/route',
      title: 'some title',
      ogDescription: 'some description',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
