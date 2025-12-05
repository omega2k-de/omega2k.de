import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImprintLinkComponent } from './imprint-link.component';
import { provideRouter } from '@angular/router';
import { provideConfig } from '@o2k/core';

describe('ImprintLinkComponent', () => {
  let component: ImprintLinkComponent;
  let fixture: ComponentFixture<ImprintLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImprintLinkComponent],
      providers: [provideRouter([]), provideConfig({ logger: 'OFF' })],
    }).compileComponents();

    fixture = TestBed.createComponent(ImprintLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
