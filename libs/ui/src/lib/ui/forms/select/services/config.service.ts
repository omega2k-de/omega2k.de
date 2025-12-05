import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { LoggerService } from '@o2k/core';
import {
  SelectComponentOptions,
  SelectObject,
  SelectOptionFactoryFn,
  UiSelectInputMode,
  UiSelectInputMultiselect,
  UiSelectInputOpen,
  UiSelectInputSorting,
  UiSelectInputType,
} from '..';

@Injectable()
export class ConfigService<T extends SelectObject> {
  private _name = signal<string>('');
  private _disabled = signal<boolean>(false);
  private _options = signal<SelectComponentOptions<T>>({});
  private logger: LoggerService = inject(LoggerService);
  readonly name: Signal<string> = this._name;
  readonly disabled: Signal<boolean> = this._disabled;
  readonly isMultiple: Signal<boolean> = computed(
    () => typeof this._options().multiselect !== 'undefined'
  );
  readonly factory: Signal<SelectOptionFactoryFn<T> | undefined> = computed(
    () => this._options().factory
  );
  readonly label: Signal<string> = computed(() => this._options().label ?? '');
  readonly type: Signal<UiSelectInputType> = computed(() => this._options().type ?? 'text');
  readonly showAll: Signal<boolean> = computed(() => this._options().showAll ?? false);
  readonly itemHeightPx: Signal<number> = computed(() => this._options().itemHeightPx ?? 44);
  readonly displayItems: Signal<number> = computed(() => this._options().displayItems ?? 5);
  readonly attrAutocomplete: Signal<AutoFill | 'one-time-code'> = computed(
    () => this._options().autocomplete ?? 'one-time-code'
  );
  readonly sorting: Signal<UiSelectInputSorting<T>> = computed(
    () => this._options().sorting ?? 'natural'
  );
  readonly open: Signal<UiSelectInputOpen> = computed(() => this._options().open ?? false);
  readonly multiselect: Signal<UiSelectInputMultiselect | undefined> = computed(
    () => this._options().multiselect
  );
  readonly mode: Signal<UiSelectInputMode> = computed(() => this._options().mode ?? 'input');

  setOptions(options: SelectComponentOptions<T>) {
    this.logger.info(`ConfigService:${this.name()}`, 'setOptions', { options });
    this._options.set(options);
  }

  setDisabled(isDisabled: boolean): void {
    this.logger.info(`ConfigService:${this.name()}`, 'setDisabled', { isDisabled });
    this._disabled.set(isDisabled);
  }

  setControlName(name: string) {
    this.logger.info(`ConfigService:${this.name()}`, 'setControlName', { name });
    this._name.set(name);
  }
}
