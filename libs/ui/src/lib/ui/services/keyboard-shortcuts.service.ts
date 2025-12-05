import { coerceArray } from '@angular/cdk/coercion';
import { inject, Injectable } from '@angular/core';
import {
  KeyboardShortcutCode,
  KeyboardShortcutInterface,
  KeyboardShortcutKey,
  LoggerService,
  ObjectHelper,
  WINDOW,
} from '@o2k/core';
import objectHash from 'object-hash';
import { fromEvent, Observable, of } from 'rxjs';

type KeyComparisonType = Pick<
  KeyboardShortcutInterface,
  'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'keyUp'
>;

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {
  private isDebug = false;
  private readonly shortcuts: KeyboardShortcutInterface[] = [];
  protected readonly window?: Window = inject(WINDOW);
  protected loggerService = inject(LoggerService);
  protected readonly keydownObservable: Observable<KeyboardEvent> = this.window
    ? fromEvent<KeyboardEvent>(this.window, 'keydown')
    : of();
  protected readonly keyupObservable: Observable<KeyboardEvent> = this.window
    ? fromEvent<KeyboardEvent>(this.window, 'keyup')
    : of();
  protected readonly keyDownSubscription = this.keydownObservable.subscribe(
    this.onKeyDown.bind(this)
  );
  protected readonly keyUpSubscription = this.keyupObservable.subscribe(this.onKeyUp.bind(this));
  public readonly isMac = /\sMac\sOS\sX\s/.test(
    this.window?.navigator.userAgent.toUpperCase() ?? ''
  );

  get commands(): KeyboardShortcutInterface[] {
    return [...this.shortcuts];
  }

  translateMacKey(key: string, isMac?: boolean): string {
    if (isMac || this.isMac) {
      switch (key) {
        case 'alt':
          return '⌥';
      }
    }
    return key;
  }

  add(shortcuts: KeyboardShortcutInterface | KeyboardShortcutInterface[]): void {
    const entries = coerceArray(shortcuts);
    const validEntries = entries.filter(
      entry => typeof entry.key !== 'undefined' || typeof entry.code !== 'undefined'
    );
    if (entries.length !== validEntries.length) {
      this.loggerService.error(
        'KeyboardShortcutsService',
        'tried to add invalid shortcut without key or code'
      );
    }
    this.shortcuts.push(...validEntries);
  }

  remove(shortcuts: KeyboardShortcutInterface | KeyboardShortcutInterface[]): void {
    for (const shortcut of coerceArray(shortcuts)) {
      const index = this.shortcuts.findIndex(
        s => this.hashShortCut(s) === this.hashShortCut(shortcut)
      );
      if (index >= 0) {
        this.shortcuts.splice(index, 1);
      }
    }
  }

  debug(state: boolean): void {
    this.isDebug = state;
  }

  private executeCommands(shortcuts: KeyboardShortcutInterface[], event: KeyboardEvent) {
    for (const shortcut of shortcuts) {
      try {
        shortcut.command(event);
      } catch (_) {
        this.loggerService.error('KeyboardShortcutsService', 'shortcut command invalid');
      }
      if (event && true === shortcut.preventDefault) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }

  private hashShortCut(shortcut: KeyboardShortcutInterface): string {
    return objectHash(
      {
        key: shortcut.key,
        code: shortcut.code,
        command: shortcut.command,
        keyUp: shortcut.keyUp,
        preventDefault: shortcut.preventDefault,
        metaKey: shortcut.metaKey,
        altKey: shortcut.altKey,
        ctrlKey: shortcut.ctrlKey,
        shiftKey: shortcut.shiftKey,
      },
      { encoding: 'hex', ignoreUnknown: true }
    );
  }

  private onKeyDown(event: KeyboardEvent) {
    if (typeof event.code !== 'undefined' || typeof event.key !== 'undefined') {
      const commands = this.getMatchingShortcuts(event, false);
      this.executeCommands(commands, event);
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    if (typeof event.code !== 'undefined' || typeof event.key !== 'undefined') {
      const commands = this.getMatchingShortcuts(event, true);
      this.executeCommands(commands, event);
    }
  }

  private getMatchingShortcuts(event: KeyboardEvent, keyUp: boolean) {
    const matched = this.shortcuts.filter((shortcut: KeyboardShortcutInterface) => {
      const keyMatch = coerceArray(shortcut.key).includes(event.key as KeyboardShortcutKey);
      const codeMatch = coerceArray(shortcut.code).includes(event.code as KeyboardShortcutCode);
      const targetMatch = !shortcut.target || shortcut.target === event.target;
      if (keyMatch || codeMatch) {
        const eventData = this.buildMatchingData({
          keyUp,
          altKey: event.altKey,
          metaKey: event.metaKey,
          ctrlKey: event.metaKey,
          shiftKey: event.shiftKey,
        });
        const shortcutData = this.buildMatchingData(shortcut);
        return targetMatch && ObjectHelper.hasSameHash(eventData, shortcutData);
      }

      return false;
    });
    if (this.isDebug) {
      this.loggerService.debug('KeyboardShortcutsService', { event, keyUp, matched });
    }
    return matched;
  }

  private buildMatchingData(shortcut: KeyComparisonType): {
    keyUp: boolean;
    altKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
  } {
    return {
      keyUp: Boolean(shortcut.keyUp),
      altKey: Boolean(shortcut.altKey),
      metaKey: Boolean(shortcut.metaKey),
      ctrlKey: Boolean(shortcut.ctrlKey),
      shiftKey: Boolean(shortcut.shiftKey),
    };
  }
}
