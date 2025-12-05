import { Component, inject, signal } from '@angular/core';
import { PlatformService, PrefetchService } from '@o2k/core';
import { ProgressRingDirective, UiProgressRingConfig } from '@o2k/ui';
import { Subject, takeUntil } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'page-controls-outlet',
  imports: [ProgressRingDirective],
  templateUrl: './controls.outlet.html',
  styleUrl: './controls.outlet.scss',
})
export class ControlsOutlet {
  protected readonly progress = signal<number>(0);
  private readonly cancelPrefetch = new Subject<void>();
  private readonly platformService = inject(PlatformService);
  private readonly prefetchService = inject(PrefetchService);

  protected readonly uiProgressRingConfig: UiProgressRingConfig = {
    color: 'var(--color-accent-2)',
    width: '4px',
    trackColor: 'transparent',
  };

  protected prefetchAll() {
    if (this.platformService.isBrowser) {
      this.cancelPrefetch.next();
      this.prefetchService
        .prefetchAll()
        .pipe(takeUntil(this.cancelPrefetch.asObservable()), untilDestroyed(this))
        .subscribe(progress => this.progress.set(progress));
    }
  }
}
