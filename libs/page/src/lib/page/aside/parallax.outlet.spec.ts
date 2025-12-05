import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParallaxOutlet } from './parallax.outlet';
import { ActivatedRoute } from '@angular/router';
import { WINDOW } from '@o2k/core';

function createWindowMock(width = 1200, height = 800): Window {
  return {
    innerWidth: width,
    innerHeight: height,
    scrollY: 0,
    pageYOffset: 0,
    requestAnimationFrame: (cb: FrameRequestCallback): number => {
      cb(0);
      return 1;
    },
    cancelAnimationFrame: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as Window;
}

function createRouteStub(data: unknown): ActivatedRoute {
  return { snapshot: { data } } as ActivatedRoute;
}

describe('ParallaxOutlet', () => {
  describe('with parallax data', () => {
    let fixture: ComponentFixture<ParallaxOutlet>;
    let component: ParallaxOutlet;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ParallaxOutlet],
        providers: [
          { provide: WINDOW, useFactory: () => createWindowMock() },
          {
            provide: ActivatedRoute,
            useValue: createRouteStub({
              parallax: {
                src: 'assets/test-image.webp',
                srcset: 'assets/test-image-1024.webp 1024w',
                sizes: '100vw',
                alt: 'Testbild',
                intensity: 0.5,
                align: 'left',
                disableBelowWidth: 500,
              },
            }),
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ParallaxOutlet);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize config from route data', () => {
      const config = component.config();
      expect(config).toBeTruthy();
      expect(config?.src).toBe('assets/test-image.webp');
      expect(config?.srcset).toContain('1024w');
      expect(config?.sizes).toBe('100vw');
      expect(config?.alt).toBe('Testbild');
      expect(config?.intensity).toBe(0.5);
      expect(config?.align).toBe('left');
      expect(config?.disableBelowWidth).toBe(500);
    });

    it('should render image element when config is present', () => {
      const img = fixture.nativeElement.querySelector(
        '.aside-parallax-img'
      ) as HTMLImageElement | null;
      expect(img).not.toBeNull();
    });

    it('should apply a transform on parallax update', () => {
      const host = fixture.nativeElement as HTMLElement;
      vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 400,
        x: 0,
        y: 0,
        toJSON() {
          // noop
        },
      });

      component['evaluateParallaxEnabled']();
      component['updateParallax'](true);
      fixture.detectChanges();

      const img = host.querySelector('.aside-parallax-img') as HTMLElement;
      expect(img.style.transform).toContain('translate3d');
    });
  });

  describe('without parallax data', () => {
    let fixture: ComponentFixture<ParallaxOutlet>;
    let component: ParallaxOutlet;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ParallaxOutlet],
        providers: [
          { provide: WINDOW, useFactory: () => createWindowMock() },
          { provide: ActivatedRoute, useValue: createRouteStub({}) },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ParallaxOutlet);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create with null config and render nothing', () => {
      expect(component).toBeTruthy();
      expect(component.config()).toBeNull();
      const img = fixture.nativeElement.querySelector('.aside-parallax-img');
      expect(img).toBeNull();
    });
  });
});
