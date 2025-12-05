import { inject, Injectable } from '@angular/core';
import { PlatformService } from './platform.service';
import { BehaviorSubject, take, tap } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalStorageService } from './local-storage.service';
import { NotifyTypes } from '../interfaces';
import { NotificationService } from './notification.service';
import { CONFIG } from '../tokens';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class DeviceNotifyService {
  private enabled = false;
  private readonly storageKey = 'o2k.notify.enabled';
  private readonly config = inject(CONFIG);
  private readonly storage = inject(LocalStorageService);
  private readonly platform = inject(PlatformService);
  private readonly notificationService = inject(NotificationService);

  private readonly enabledSubject = new BehaviorSubject<boolean>(false);
  readonly enabled$ = this.enabledSubject.asObservable();

  init() {
    if (
      this.platform.isBrowser &&
      typeof Notification === 'function' &&
      typeof Notification.requestPermission === 'function'
    ) {
      this.enabled =
        this.storage.get(this.storageKey) === '1' && Notification.permission === 'granted';
      this.enabledSubject.next(this.enabled);
    }
  }

  disable() {
    if (this.enabled) {
      this.updatePermission('default');
    }
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
      setTimeout(() => this.notify(), 3000);
    }
  }

  enable() {
    if (
      !this.enabled &&
      this.platform.isBrowser &&
      typeof Notification === 'function' &&
      typeof Notification.requestPermission === 'function'
    ) {
      fromPromise(Notification.requestPermission())
        .pipe(
          take(1),
          tap(permission => this.notifyIfDenied(permission)),
          untilDestroyed(this)
        )
        .subscribe(permission => this.updatePermission(permission));
    }
  }

  notify() {
    if (this.enabled) {
      const openUrl = `${this.config.url}/content`;
      const options: NotificationOptions = {
        body: `Du hast die Berechtigung gegeben, aber bis das Feature produktiv genutzt wird, dauert es noch etwas. Mit einem Klick solltest Du im Content landen.`,
        icon: `${this.config.url}/icons/icon-144x144.webp`,
        dir: 'auto',
        lang: 'de',
        silent: true,
        requireInteraction: true,
        tag: 'update',
      };
      const notification = new Notification('Benachrichtigungen aktiviert', options);
      notification.addEventListener('click', (_: Event) => open(openUrl, '_self', 'noopener'));
    }
  }

  private updatePermission(permission: NotificationPermission) {
    this.enabled = permission === 'granted';
    this.enabledSubject.next(this.enabled);
    this.storage.save(this.storageKey, this.enabled ? '1' : '0');
  }

  private notifyIfDenied(permission: NotificationPermission) {
    if (permission === 'denied') {
      const notification: NotifyTypes = {
        created: Date.now(),
        type: 'growl',
        important: true,
        title: `Keine Berechtigung für Benachrichtigungen!`,
        message: `Wenn Du versehentlich die Berechtigung blockiert hast, tippe auf das Symbol am Anfang der URL im Browser oder in den App-Einstellungen, wenn als PWA installiert.`,
        icon: 'error',
        clearTimeoutOnExpand: true,
        data: null,
      };
      this.notificationService.notify(notification);
    }
  }
}
