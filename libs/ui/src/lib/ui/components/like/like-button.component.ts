import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikesService, LikeState } from '@o2k/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IconDirective, VibrateDirective } from '../../directives';

@UntilDestroy()
@Component({
  selector: 'ui-like-button',
  imports: [CommonModule, IconDirective, VibrateDirective],
  templateUrl: './like-button.component.html',
  styleUrls: ['./like-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LikeButtonComponent {
  private readonly likesService = inject(LikesService);

  readonly state = input<LikeState | null | undefined>(undefined);
  readonly articleId = input.required<number>();

  readonly liked = signal(false);
  readonly count = signal<number | null>(null);
  readonly loading = signal(true);

  constructor() {
    effect(() => {
      const state = this.state();
      const articleId = this.articleId();
      if (state) {
        this.applyState(state);
        this.loading.set(false);
      } else if (state === undefined) {
        this.load(articleId);
      } else {
        this.loading.set(false);
      }
    });
  }

  load(id: number): void {
    this.loading.set(true);
    this.likesService
      .getState(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: state => {
          this.applyState(state);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  toggle(): void {
    if (this.loading()) {
      return;
    }
    const id = this.articleId();
    this.loading.set(true);
    this.likesService
      .toggle(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: state => {
          this.applyState(state);
          this.loading.set(false);
        },
        error: () => {
          this.liked.set(false);
          this.loading.set(false);
        },
      });
  }

  private applyState(state: LikeState): void {
    this.liked.set(state.liked === true);
    this.count.set(state.count ?? 0);
  }
}
