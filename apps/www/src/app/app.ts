import { Component, computed, DOCUMENT, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AnimatedBackdropComponent, FooterComponent, GooComponent, HeaderComponent } from '@o2k/ui';
import { CoordinatorService, PlatformService } from '@o2k/core';
import { debounceTime, filter, first, map, startWith, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    RouterOutlet,
    GooComponent,
    AnimatedBackdropComponent,
    HeaderComponent,
    FooterComponent,
  ],
})
export class App {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly platform = inject(PlatformService);
  private readonly coordinator = inject(CoordinatorService);
  protected readonly showBackdrop = computed(
    () => this.coordinator.isNavigationOpen() || this.coordinator.isAsideOpen()
  );

  isStable = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      debounceTime(16),
      first(),
      switchMap(() => new Promise(r => setTimeout(r))),
      map(() => true),
      startWith(false)
    ),
    { requireSync: true }
  );

  constructor() {
    if (this.platform.isBrowser) {
      effect(() => {
        const stable = this.isStable();
        if (this.doc?.documentElement && stable) {
          requestAnimationFrame(() => this.doc.documentElement.removeAttribute('data-init'));
        }
      });
    }
  }
}
