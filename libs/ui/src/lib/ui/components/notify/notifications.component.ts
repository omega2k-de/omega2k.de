import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IconDirective, VibrateDirective } from '../../directives';
import { OverlayComponent } from './overlay.component';
import { GrowlComponent } from './components';
import { NotificationService, NotificationTypes } from '@o2k/core';
import { tap } from 'rxjs';

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

  protected minimized = signal(true);
  protected messages = signal<NotificationTypes[]>([]);

  ngOnInit(): void {
    this.service.notifications$
      .pipe(
        tap(messages => {
          if (!this.hasSeenAllImportantMessages(messages)) {
            this.minimized.set(false);
          }
        }),
        untilDestroyed(this)
      )
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
    this.minimized.set(false);
  }

  protected toggleMinimize() {
    this.minimized.set(!this.minimized());
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
