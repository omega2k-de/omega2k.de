import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntilDestroy } from '@ngneat/until-destroy';
import { WINDOW } from '@o2k/core';
import { delay, map, Subscription, take, timer } from 'rxjs';
import { BadgeAction, ConfigService, FocusService, SelectionService, SelectObject } from '..';
import { IconDirective } from '../../../directives';

@UntilDestroy()
@Component({
  selector: 'ui-badge-actions',
  imports: [IconDirective],
  templateUrl: './badge-actions.component.html',
  styleUrl: './badge-actions.component.scss',
})
export class BadgeActionsComponent<T extends SelectObject> {
  private focusS: FocusService<T> = inject(FocusService<T>, { self: false });
  private selectionS: SelectionService<T> = inject(SelectionService<T>, { self: false });
  private configS = inject(ConfigService<T>, { self: false });
  private elementRef = inject(ElementRef<HTMLElement>);
  private window = inject(WINDOW);
  private renderer2 = inject(Renderer2);
  private badgeFlipTimer: Subscription | null = null;
  protected badgeFlipped = signal<boolean>(false);
  protected animationDurationMs = input<number>(400 / 2);
  protected isVisible = toSignal(
    this.focusS.focusElement$.pipe(
      delay(100),
      map(focus => focus !== 'input')
    )
  );
  protected count = toSignal(this.selectionS.changes$.pipe(map(changes => changes?.count ?? 0)), {
    requireSync: true,
  });
  pressed = output<BadgeAction>();

  constructor() {
    effect(() => {
      const tabindex =
        this.configS.disabled() || this.count() === 0 || this.focusS.focusElement() === 'input'
          ? '-1'
          : '0';
      this.renderer2.setAttribute(this.elementRef.nativeElement, 'tabindex', tabindex);
    });
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  onBlur() {
    this.badgeFlip(false);
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  onFocus() {
    this.badgeFlip(true);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('click', ['$event'])
  onPressed(event?: Event) {
    if (!this.configS.disabled() && this.badgeFlipped()) {
      event?.preventDefault();
      event?.stopImmediatePropagation();
      this.pressed.emit('clear');
    }
  }

  @HostListener('pointerup')
  vibrate() {
    if (!this.configS.disabled() && this.window?.navigator && 'vibrate' in this.window.navigator) {
      this.window.navigator.vibrate(0);
      this.window.navigator.vibrate([5, 5]);
    }
    return true;
  }

  badgeFlip(started: boolean) {
    this.badgeFlipTimer?.unsubscribe();
    this.badgeFlipTimer = timer(this.animationDurationMs())
      .pipe(take(1))
      .subscribe(() => this.badgeFlipped.set(started));
  }
}
