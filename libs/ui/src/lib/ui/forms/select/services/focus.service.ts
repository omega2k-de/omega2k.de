import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonHelper, LoggerService } from '@o2k/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ConfigService } from '.';
import { SelectObject } from '..';

export declare type FocusElement = 'badge' | 'input' | 'label' | 'select' | 'list' | 'option';

@Injectable()
export class FocusService<T extends SelectObject> {
  private _focusElement: FocusElement | null = null;
  private focusElementSubject: BehaviorSubject<FocusElement | null> =
    new BehaviorSubject<FocusElement | null>(null);
  private configS: ConfigService<T> = inject(ConfigService<T>, { self: false });
  private logger: LoggerService = inject(LoggerService);
  readonly focusElement$ = this.focusElementSubject.asObservable();
  readonly focusElement: Signal<FocusElement | null> = toSignal<FocusElement | null>(
    this.focusElement$.pipe(
      tap(focus =>
        this.logger.debug(
          `FocusService:${this.configS.name()}`,
          'focusElement$',
          JsonHelper.stringify(focus)
        )
      )
    ),
    { initialValue: null }
  );
  readonly isFocusTrapDisabled: Signal<boolean> = computed(
    () => this.focusElement() !== null || this.configS.disabled()
  );

  get focus(): FocusElement | null {
    return this._focusElement;
  }

  set focus(value: FocusElement | null) {
    this._focusElement = value;
    this.focusElementSubject.next(value);
  }
}
