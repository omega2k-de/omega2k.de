import { ViewportScroller } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter, Observable, pairwise, startWith, Subscription } from 'rxjs';
import { WINDOW } from '../tokens';
import { distinctUntilChanged } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class ScrollPositionService {
  private routerSubscription: Subscription | null = null;
  private router: Router = inject(Router);
  private viewport: ViewportScroller = inject(ViewportScroller);
  private readonly window?: Window = inject(WINDOW);
  private readonly routerScrollEvents$: Observable<Scroll> = this.router.events.pipe(
    filter(e => e instanceof Scroll)
  );

  constructor() {
    this.viewport.setHistoryScrollRestoration('manual');
  }

  enable() {
    if (!this.routerSubscription) {
      this.routerSubscription = this.routerScrollEvents$
        .pipe(
          startWith(undefined),
          pairwise(),
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
          untilDestroyed(this)
        )
        .subscribe((e: (Scroll | undefined)[]) => {
          const previous: undefined | Scroll = e[0];
          const current: undefined | Scroll = e[1];

          if (current?.position) {
            this.viewport.scrollToPosition(current.position);
          } else if (current?.anchor) {
            this.viewport.scrollToAnchor(current.anchor);
          } else if (
            previous?.routerEvent instanceof NavigationEnd &&
            current?.routerEvent instanceof NavigationEnd
          ) {
            if (
              this.getBaseRoute(previous.routerEvent.urlAfterRedirects) !==
              this.getBaseRoute(current.routerEvent.urlAfterRedirects)
            ) {
              this.viewport.scrollToPosition([0, 0]);
              this.window?.requestAnimationFrame(() =>
                this.window?.scrollTo({ left: 0, top: 0, behavior: 'instant' })
              );
            }
          }
        });
    }
  }

  disable() {
    this.routerSubscription?.unsubscribe();
    this.routerSubscription = null;
  }

  private getBaseRoute(url: string): string {
    return url.split('?')[0]?.replace(/\([^)]+\)/gi, '') ?? '';
  }
}
