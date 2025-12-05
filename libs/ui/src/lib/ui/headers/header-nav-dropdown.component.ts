import { Component, HostListener, inject, Signal, signal } from '@angular/core';
import {
  CoordinatorService,
  LocalStorageService,
  NavigationService,
  PageRecordTree,
} from '@o2k/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective, VibrateDirective } from '../directives';
import { debounceTime, filter, first, switchMap } from 'rxjs';

@Component({
  selector: 'ui-header-nav-dropdown',
  imports: [NgTemplateOutlet, RouterLink, IconDirective, VibrateDirective, RouterLinkActive],
  templateUrl: './header-nav-dropdown.component.html',
  styleUrl: './header-nav-dropdown.component.scss',
  host: {
    class: 'nm-raised nav-wrapper',
    '[attr.aria-haspopup]': '"true"',
    '[attr.aria-expanded]': 'coordinator.isNavigationOpen() ? "true" : "false"',
    '[attr.data-open]': 'coordinator.isNavigationOpen() ? "true" : "false"',
  },
})
export class HeaderNavDropdownComponent {
  private static readonly OPEN_GROUPS_KEY = 'navigation';

  protected readonly coordinator = inject(CoordinatorService);
  private readonly navigation = inject(NavigationService);
  private readonly router = inject(Router);
  private readonly storage = inject(LocalStorageService);

  readonly tree: Signal<PageRecordTree | null> = toSignal(this.navigation.tree(), {
    initialValue: null,
  });

  private readonly openGroups = signal<ReadonlySet<number>>(new Set<number>());

  constructor() {
    const raw = this.storage.get(HeaderNavDropdownComponent.OPEN_GROUPS_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return;
      }
      const ids = parsed.filter(id => Number.isInteger(id as number)) as number[];
      this.openGroups.set(new Set<number>(ids));
    } catch {
      return;
    }
  }

  protected isExpanded(id?: number | null): boolean {
    if (!id) {
      return false;
    }
    return this.openGroups().has(id);
  }

  protected toggleGroup(id: number, event?: Event): void {
    if (event) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
    const current = new Set(this.openGroups());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.openGroups.set(current);
    this.persistOpenGroups(current);
  }

  protected groupLabel(title: string): string {
    const index = title.indexOf(':');
    return index > -1 ? title.slice(0, index) : title;
  }

  protected removeLabel(title: string): string {
    const index = title.indexOf(':');
    return index > -1 ? title.slice(index + 1).trim() : title;
  }

  private persistOpenGroups(open: Set<number>): void {
    const ids = Array.from(open.values());
    this.storage.save(HeaderNavDropdownComponent.OPEN_GROUPS_KEY, JSON.stringify(ids));
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  @HostListener('click', ['$event'])
  onClick(e: Event): void {
    if (e.target instanceof HTMLAnchorElement) {
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          debounceTime(16),
          first(),
          switchMap(() => new Promise(r => setTimeout(r)))
        )
        .subscribe(() => this.coordinator.toggleNavigationOverlay(false));
    } else if (e.target instanceof HTMLDivElement) {
      const id = Number(e.target.dataset['id'] ?? 0);
      if (id > 0) {
        this.toggleGroup(id);
      }
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }
}
