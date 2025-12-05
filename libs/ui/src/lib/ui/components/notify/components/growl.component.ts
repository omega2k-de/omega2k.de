import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import {
  IconDirective,
  ProgressRingDirective,
  UiProgressRingConfig,
  VibrateDirective,
} from '../../../directives';
import { HealthRendererComponent } from '../renderer';
import { NotificationTypes } from '@o2k/core';

@UntilDestroy()
@Component({
  selector: 'ui-growl',
  imports: [IconDirective, ProgressRingDirective, HealthRendererComponent, VibrateDirective],
  templateUrl: './growl.component.html',
  styleUrl: './growl.component.scss',
  host: {
    role: 'button',
    tabindex: '0',
    '[attr.aria-expanded]': 'expanded() ? "true" : "false"',
    '[attr.aria-pressed]': 'expanded() ? "true" : "false"',
  },
})
export class GrowlComponent {
  private renderer2 = inject(Renderer2);
  private elementRef = inject(ElementRef<HTMLElement>);
  private overflowTimeout: NodeJS.Timeout | number | null = null;
  protected readonly uiProgressRingConfig: UiProgressRingConfig = {
    centerColor: 'var(--color-white)',
    trackColor: 'var(--color-white)',
  };
  readonly message = input.required<NotificationTypes>();
  readonly expanded = signal(false);
  readonly progress = computed(() => this.message().progress ?? 0);

  constructor() {
    effect(() => {
      if (this.expanded()) {
        this.renderer2.addClass(this.elementRef.nativeElement, 'expanded');
        if (this.overflowTimeout) {
          clearTimeout(this.overflowTimeout);
        }
        this.overflowTimeout = setTimeout(() => {
          this.renderer2.addClass(this.elementRef.nativeElement, 'overflow-y');
        }, 500);
      } else {
        this.renderer2.removeClass(this.elementRef.nativeElement, 'expanded');
        this.renderer2.removeClass(this.elementRef.nativeElement, 'overflow-y');
      }
    });
  }

  @HostListener('keydown.enter')
  @HostListener('click')
  toggle() {
    this.expanded.set(!this.expanded());
    if (this.expanded()) {
      this.message().onExpand();
    }
  }
}
