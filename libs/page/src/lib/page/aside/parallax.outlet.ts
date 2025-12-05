import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { ParallaxConfig, WINDOW } from '@o2k/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'page-parallax-outlet',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './parallax.outlet.html',
  styleUrl: './parallax.outlet.scss',
  host: {
    class: 'nm-raised nm-button',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParallaxOutlet implements OnInit, OnDestroy {
  config = signal<ParallaxConfig | null>(null);
  translateX = 0;

  private scrollListener: (() => void) | null = null;
  private resizeListener: (() => void) | null = null;
  private rafId: number | null = null;
  private parallaxEnabled = false;

  private readonly route = inject(ActivatedRoute);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly win = inject(WINDOW);

  ngOnInit(): void {
    const data = this.route.snapshot.data['parallax'] as ParallaxConfig | undefined;
    if (!data) {
      return;
    }
    this.config.set({
      intensity: 0.3,
      align: 'right',
      disableBelowWidth: 768,
      ...data,
    });
    if (this.isBrowser()) {
      this.setupListeners();
      this.updateParallax(true);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = null;
    }
    if (this.resizeListener) {
      this.resizeListener();
      this.resizeListener = null;
    }
    if (this.rafId !== null && this.win) {
      this.win.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!this.win;
  }

  private setupListeners(): void {
    if (!this.win) {
      return;
    }
    this.evaluateParallaxEnabled();
    this.scrollListener = this.renderer.listen(this.win, 'scroll', () => {
      if (!this.parallaxEnabled) {
        return;
      }
      this.scheduleUpdate();
    });
    this.resizeListener = this.renderer.listen(this.win, 'resize', () => {
      this.evaluateParallaxEnabled();
      this.updateParallax(true);
    });
  }

  private evaluateParallaxEnabled(): void {
    const config = this.config();
    if (!this.win || !config) {
      this.parallaxEnabled = false;
      return;
    }
    const width = this.win.innerWidth || 0;
    const disableBelow = config.disableBelowWidth ?? 768;
    this.parallaxEnabled = width >= disableBelow;
    if (!this.parallaxEnabled) {
      this.translateX = 0;
      this.applyTransform();
    }
  }

  private scheduleUpdate(): void {
    if (!this.win) {
      return;
    }
    if (this.rafId !== null) {
      return;
    }
    this.rafId = this.win.requestAnimationFrame(() => {
      this.rafId = null;
      this.updateParallax();
    });
  }

  private updateParallax(force = false): void {
    const config = this.config();
    if (!this.parallaxEnabled || !this.win || !config) {
      return;
    }
    const host = this.elRef.nativeElement;
    const rect = host.getBoundingClientRect();
    const viewportHeight = this.win.innerHeight || 1;
    const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
    const normalized = Math.max(-1, Math.min(1, centerOffset / viewportHeight));
    const intensity = config.intensity ?? 0.3;
    const direction = config.align === 'left' ? -1 : 1;
    const maxOffset = 50;
    const target = normalized * maxOffset * intensity * direction;
    if (!force && Math.abs(target - this.translateX) < 0.5) {
      return;
    }
    this.translateX = target;
    this.applyTransform();
  }

  private applyTransform(): void {
    const host = this.elRef.nativeElement;
    const img = host.querySelector('.aside-parallax-img') as HTMLElement | null;
    if (!img) {
      return;
    }
    const value = `translate3d(${this.translateX}px, 0, 0)`;
    this.renderer.setStyle(img, 'transform', value);
  }
}
