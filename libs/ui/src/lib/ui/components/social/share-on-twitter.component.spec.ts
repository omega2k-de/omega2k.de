import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareOnTwitterComponent } from './share-on-twitter.component';
import { ORIGIN, provideConfig } from '@o2k/core';
import { provideRouter } from '@angular/router';

describe('ShareOnTwitterComponent', () => {
  let component: ShareOnTwitterComponent;
  let fixture: ComponentFixture<ShareOnTwitterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareOnTwitterComponent],
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideRouter([]),
        {
          provide: ORIGIN,
          useValue: 'https://www.omega2k.de',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareOnTwitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
