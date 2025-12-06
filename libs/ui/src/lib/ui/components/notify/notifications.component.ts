import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IconDirective, VibrateDirective } from '../../directives';
import { OverlayComponent } from './overlay.component';
import { GrowlComponent } from './components';
import { CoordinatorService, NotificationService, NotificationTypes } from '@o2k/core';

@UntilDestroy()
@Component({
  selector: 'ui-notifications',
  imports: [OverlayComponent, GrowlComponent, IconDirective, VibrateDirective],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private seenImportantIds = new Map<string, boolean>();
  private service = inject(NotificationService);

  protected coordinator = inject(CoordinatorService);
  protected messages = signal<NotificationTypes[]>([]);

  constructor() {
    effect(() => {
      const messages = this.messages();
      if (messages.length === 0) {
        this.coordinator.toggleNotificationOverlay(false);
      } else if (!this.hasSeenAllImportantMessages(messages)) {
        this.coordinator.toggleNotificationOverlay(true);
      }
    });
  }

  ngOnInit(): void {
    this.service.notifications$
      .pipe(untilDestroyed(this))
      .subscribe(list => this.messages.set(list));
  }

  ngOnDestroy(): void {
    this.seenImportantIds.clear();
  }

  protected cancelAll() {
    for (const message of this.messages()) {
      message.onCancel();
    }
    this.seenImportantIds.clear();
    this.coordinator.toggleNotificationOverlay(false);
  }

  protected toggleMinimize() {
    this.coordinator.toggleNotificationOverlay();
  }

  private hasSeenAllImportantMessages(messages: NotificationTypes[]) {
    return messages
      .filter(message => true === message.important)
      .map(message => {
        if (!this.seenImportantIds.has(message.id)) {
          this.seenImportantIds.set(message.id, true);
          return false;
        }
        return true;
      })
      .reduce((p, c) => p && c, true);
  }
}
