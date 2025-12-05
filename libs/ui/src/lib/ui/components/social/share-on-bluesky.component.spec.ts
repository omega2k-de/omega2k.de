import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareOnBlueskyComponent } from './share-on-bluesky.component';
import { ORIGIN, provideConfig } from '@o2k/core';
import { provideRouter } from '@angular/router';

describe('ShareOnBlueskyComponent', () => {
  let component: ShareOnBlueskyComponent;
  let fixture: ComponentFixture<ShareOnBlueskyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareOnBlueskyComponent],
      providers: [
        provideConfig({ logger: 'OFF' }),
        provideRouter([]),
        {
          provide: ORIGIN,
          useValue: 'https://www.omega2k.de',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareOnBlueskyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
