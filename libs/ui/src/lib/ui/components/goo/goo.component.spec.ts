import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GooComponent } from './goo.component';
import { MockProvider } from 'ng-mocks';
import { Renderer2 } from '@angular/core';

describe('GooComponent', () => {
  let component: GooComponent;
  let fixture: ComponentFixture<GooComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GooComponent],
      providers: [MockProvider(Renderer2)],
    }).compileComponents();

    fixture = TestBed.createComponent(GooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
