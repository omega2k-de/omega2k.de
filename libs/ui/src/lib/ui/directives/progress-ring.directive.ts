import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  Renderer2,
  Signal,
} from '@angular/core';

export type UiProgressRingMode = 'elapsed' | 'remaining';

export interface UiProgressRingConfig {
  mode?: UiProgressRingMode; // default: 'elapsed'
  width?: number | string; // default: '3px'
  color?: string | null; // default: 'currentColor'
  trackColor?: string | null; // default: 'transparent'
  centerColor?: string | null; // default: null
  overlayColor?: string | null; // default: null
  overlayMode?: UiProgressRingMode; // default: 'elapsed'
  animate?: boolean;
}

@Directive({
  selector: '[uiProgressRing]',
  exportAs: 'uiProgressRing',
})
export class ProgressRingDirective {
  readonly progress: InputSignal<number | null> = input<number | null>(null);
  readonly config: InputSignal<UiProgressRingConfig | null> = input<UiProgressRingConfig | null>(
    null
  );

  private host = inject(ElementRef<HTMLElement>).nativeElement;
  private renderer2 = inject(Renderer2);
  private radialCenter = computed(
    () =>
      `radial-gradient(circle at 50% 50%, ${this.centerColor()} 100%, ${this.centerColor()} 100%)`
  );

  private normalized: Signal<number | null> = computed(() => {
    const v = this.progress();
    return v === null || Number.isNaN(+v) ? null : Math.max(0, Math.min(1, +v));
  });

  private merged = computed<Required<UiProgressRingConfig>>(() => {
    const config = this.config() ?? {};
    return {
      width: config.width ?? 3,
      color: config.color ?? 'currentColor',
      trackColor: config.trackColor ?? 'transparent',
      mode: config.mode ?? 'elapsed',
      centerColor: config.centerColor ?? null,
      overlayColor: config.overlayColor ?? null,
      overlayMode: config.overlayMode ?? config.mode ?? 'elapsed',
      animate: config.animate ?? false,
    };
  });
  private widthCss = computed(() => {
    const w = this.merged().width;
    return typeof w === 'number' ? `${w}px` : w?.toString() || '3px';
  });
  private centerColor = computed(() => {
    const cfg = this.merged();
    if (cfg.centerColor !== null) {
      return cfg.centerColor;
    }
    if (typeof getComputedStyle === 'function') {
      return getComputedStyle(this.host).backgroundColor || 'transparent';
    }
    return 'transparent';
  });
  private conicRing = computed(() => {
    const p = this.normalized();
    if (p === null) {
      return null;
    }
    const { color, trackColor, mode } = this.merged();
    return mode === 'remaining'
      ? `conic-gradient(transparent calc(${p} * 1turn), ${color} 0)`
      : `conic-gradient(${color} calc(${p} * 1turn), ${trackColor} 0)`;
  });
  private conicOverlay = computed(() => {
    const p = this.normalized();
    if (p === null) {
      return null;
    }
    const { overlayColor, overlayMode } = this.merged();
    if (!overlayColor || overlayColor === 'transparent') {
      return null;
    }
    return overlayMode === 'remaining'
      ? `conic-gradient(transparent calc(${p} * 1turn), ${overlayColor} 0)`
      : `conic-gradient(${overlayColor} calc(${p} * 1turn), transparent 0)`;
  });

  constructor() {
    effect(() => {
      const p = this.normalized();
      const width = this.widthCss();
      const ring = this.conicRing();
      const center = this.radialCenter();
      const overlay = this.conicOverlay();

      if (p === null) {
        this.clear();
        return;
      }

      const layers: string[] = [];
      const clips: string[] = [];

      if (overlay) {
        layers.push(`${overlay} padding-box`);
        clips.push('padding-box');
      }

      layers.push(`${center} padding-box`);
      clips.push('padding-box');

      if (ring) {
        layers.push(`${ring} border-box`);
        clips.push('border-box');
      }

      this.renderer2.setStyle(this.host, 'border', `${width} solid rgba(0,0,0,0)`);
      this.renderer2.setStyle(this.host, 'background', layers.join(','));
      this.renderer2.setStyle(this.host, 'backgroundClip', clips.join(','));
    });
  }

  private clear() {
    this.renderer2.removeStyle(this.host, 'background');
    this.renderer2.removeStyle(this.host, 'backgroundClip');
    this.renderer2.removeStyle(this.host, 'border');
  }
}
