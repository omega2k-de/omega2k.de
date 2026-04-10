import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LikesService, LikeState } from '@o2k/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IconDirective, VibrateDirective } from '../../directives';

@UntilDestroy()
@Component({
  selector: 'ui-like-button',
  imports: [IconDirective, VibrateDirective],
  templateUrl: './like-button.component.html',
  styleUrls: ['./like-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LikeButtonComponent implements AfterViewInit {
  private readonly likesService = inject(LikesService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly state = input<LikeState | undefined>(undefined);
  readonly articleId = input.required<number>();

  readonly liked = signal(false);
  readonly count = signal<number | null>(null);
  readonly loading = signal(true);

  private readonly refreshedOnce = signal(false);

  constructor() {
    effect(() => {
      const state = this.state();
      const articleId = this.articleId();
      if (state) {
        this.applyState(state);
        this.loading.set(false);
      } else if (articleId) {
        this.load(articleId);
      } else {
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.refreshedOnce()) {
      this.refreshedOnce.set(true);
      this.load(this.articleId());
    }
  }

  load(id: number): void {
    this.loading.set(true);
    this.likesService
      .getState(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: state => {
          this.applyState(state);
        },
        complete: () => {
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
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  private applyState(state: LikeState): void {
    if (typeof state.liked === 'boolean') {
      this.liked.set(state.liked);
    }
    this.count.set(state.count ?? 0);
  }
}
