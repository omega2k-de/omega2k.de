import { Component, computed, DOCUMENT, effect, HostListener, inject, signal } from '@angular/core';
import { HeaderNavDropdownComponent } from './header-nav-dropdown.component';
import { IconDirective, VibrateDirective } from '../directives';
import { NotificationsComponent } from '../components';
import {
  CoordinatorService,
  LocalStorageService,
  NotificationService,
  ScrollProgressService,
  WEBSOCKET_WORKER,
  WINDOW,
} from '@o2k/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewportScroller } from '@angular/common';
import { filter, map } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ui-header',
  imports: [HeaderNavDropdownComponent, IconDirective, NotificationsComponent, VibrateDirective],
  host: {
    id: 'appShell',
    role: 'banner',
    class: 'nm-raised relative',
    '[attr.aria-label]': '"Header"',
    '[style.--reading-progress]': "scrollProgress()+'%'",
    '[class.app-shell--compact]': 'isHeaderCompact()',
  },
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly scrollProgressService = inject(ScrollProgressService);
  protected readonly themeIcon = computed(() => (this.theme() === 'light' ? '☀️' : '🌙'));
  protected readonly scrollProgress = toSignal(this.scrollProgressService.progress$, {
    initialValue: 0,
  });
  private readonly doc = inject(DOCUMENT);
  private readonly win = inject(WINDOW);
  private readonly worker = inject(WEBSOCKET_WORKER);
  private readonly coordinator = inject(CoordinatorService);
  private readonly storage = inject(LocalStorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly headerScrollThreshold = 16;
  private readonly viewportScroller = inject(ViewportScroller);
  protected readonly isNavOpen = this.coordinator.isNavigationOpen;
  protected readonly isAsideOpen = this.coordinator.isAsideOpen;

  protected readonly navToggleLabel = computed(() =>
    this.coordinator.isNavigationOpen() ? 'Navigation schließen' : 'Navigation öffnen'
  );
  protected readonly asideToggleLabel = computed(() =>
    this.coordinator.isAsideOpen() ? 'Seitenmenü schließen' : 'Seitenmenü öffnen'
  );
  protected readonly isNotificationEnabled = this.notificationService.localNotificationsEnabled;
  protected readonly notificationToggleLabel = computed(() =>
    this.isNotificationEnabled()
      ? 'Benachrichtigungen deaktivieren'
      : 'Benachrichtigungen aktivieren'
  );
  protected readonly deck = signal<boolean>(false);
  protected readonly isHeaderCompact = signal<boolean>(false);
  protected readonly theme = signal<string>('light');
  protected readonly fontSizePx = signal<number>(16);

  protected readonly clientCount = toSignal(
    this.worker.message$.pipe(
      filter(
        message =>
          message.event === 'clients' ||
          message.event === 'health' ||
          message.event === 'heartbeat' ||
          message.event === 'open' ||
          message.event === 'close'
      ),
      map(message => {
        if (message.event === 'clients') {
          return message.count ?? 0;
        } else if ('health' in message && message.health.clients) {
          return message.health.clients;
        }
        return 0;
      }),
      untilDestroyed(this)
    ),
    { initialValue: 0 }
  );

  constructor() {
    this.viewportScroller.setOffset(() => [0, 100]);
    this.initTheme();
    this.initNotify();
    this.initFontSizePx();

    effect(() => {
      const theme = this.theme();
      if (this.doc?.documentElement) {
        this.doc.documentElement.setAttribute('data-theme', theme);
        this.storage.save('theme', theme);
      }
    });
    effect(() => {
      const open = this.isAsideOpen();
      if (this.doc?.documentElement) {
        this.doc.documentElement.setAttribute('data-aside', String(open));
      }
    });
    effect(() => {
      const fontSizePx = this.fontSizePx();
      if (this.doc?.documentElement) {
        this.doc.documentElement.style.fontSize = `${fontSizePx}px`;
        this.storage.save('fontSizePx', String(fontSizePx));
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.handleScroll();
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  changeFontSize(direction: 'up' | 'down'): void {
    const fontSize = this.fontSizePx();
    if (direction === 'down' && fontSize > 16) {
      this.fontSizePx.set(fontSize - 2);
    } else if (direction === 'up' && fontSize < 20) {
      this.fontSizePx.set(fontSize + 2);
    }
  }

  toggleNotifications() {
    this.notificationService.toggleNotifications();
  }

  toggleNav(): void {
    this.coordinator.toggleNavigationOverlay();
  }

  toggleAside(): void {
    this.coordinator.toggleAsideOverlay();
  }

  private initTheme(): void {
    let theme = this.storage.get('theme');
    if (!theme && typeof this.win !== 'undefined' && 'matchMedia' in this.win) {
      theme = this.win.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (theme !== 'dark' && theme !== 'light') {
      theme = 'light';
    }
    this.theme.set(theme);
  }

  private initFontSizePx(): void {
    const fontSizePx = parseInt(this.storage.get('fontSizePx') ?? this.fontSizePx().toFixed(0));
    this.fontSizePx.set(fontSizePx);
  }

  private initNotify(): void {
    const notify = this.storage.get('notify') === 'true';
    this.notificationService.toggleNotifications(notify);
  }

  private handleScroll = (): void => {
    if (typeof this.win === 'undefined') {
      return;
    }

    const compact = this.win.scrollY > this.headerScrollThreshold;
    if (compact !== this.isHeaderCompact()) {
      this.isHeaderCompact.set(compact);
    }
  };
}
