import { coerceArray } from '@angular/cdk/coercion';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@o2k/core';
import hash from 'object-hash';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from '.';
import {
  SelectedData,
  SelectItemOptions,
  SelectObject,
  UiOption,
  UiSelectFormValue,
  UiSelectValue,
} from '..';

@Injectable()
export class SelectionService<T extends SelectObject> {
  private logger: LoggerService = inject(LoggerService);
  private configS: ConfigService<T> = inject(ConfigService<T>, { self: false });

  private selectedHashMap = new Map<UiOption<T>['hash'], UiOption<T>>();
  private selectedArray: UiOption<T>[] = Array.from(this.selectedHashMap.values());
  private valueChangesSubject = new BehaviorSubject<SelectedData<T> | null>(null);

  readonly changes$: Observable<SelectedData<T> | null> = this.valueChangesSubject.asObservable();

  get selectionCount(): number {
    return this.selectedHashMap.size;
  }

  get selectedItemValues(): UiSelectFormValue<T> {
    const mappedItems = this.selectedArray.map(item => item.item);
    return this.configS.multiselect() ? mappedItems : (mappedItems.pop() ?? null);
  }

  get hasSelection(): boolean {
    return this.selectionCount > 0;
  }

  deselect(value: UiOption<T>, options?: SelectItemOptions) {
    this.logger.debug(`SelectionService:${this.configS.name()}`, 'deselect', {
      value,
      options,
    });

    if (!this.isSelected(value)) {
      this.publish(options);
      return;
    }

    this.selectedHashMap.delete(value.hash);
    this.publish(options);
  }

  clear(options?: SelectItemOptions) {
    this.logger.debug(`SelectionService:${this.configS.name()}`, 'clear', { options });

    if (!this.hasSelection) {
      this.publish(options);
      return;
    }

    this.selectedHashMap.clear();
    this.publish(options);
  }

  select(value: UiSelectValue<T>, options?: SelectItemOptions) {
    this.logger.debug(`SelectionService:${this.configS.name()}`, 'select', {
      value,
      options,
    });

    if (value && !Array.isArray(value) && this.isSelected(value)) {
      this.publish(options);
      return;
    } else if (value === null && !this.hasSelection) {
      this.publish(options);
      return;
    }

    if (!this.configS.isMultiple() || null === value) {
      this.clear({ emitEvent: false });
    }

    if (null !== value) {
      for (const option of coerceArray(value)) {
        this.selectedHashMap.set(option.hash, option);
      }
    }

    this.publish(options);
  }

  toggle(value: UiOption<T>, options?: SelectItemOptions) {
    const isMultiple = this.configS.isMultiple();
    if (isMultiple && this.isSelected(value)) {
      this.deselect(value, options);
    } else {
      this.select(value, options);
    }
  }

  isSelected = (option: UiOption<T>) => this.selectedHashMap.has(option.hash);

  toString(): string {
    const multiselect = this.configS.multiselect();
    const hasData = this.hasSelection;
    const prefix = `${hasData ? (multiselect?.prefix ?? '') : ''}`;
    const suffix = `${hasData ? (multiselect?.suffix ?? '') : ''}`;
    return `${prefix}${this.selectedArray.map(item => item.label).join(multiselect?.separator ?? ', ')}${suffix}`.trim();
  }

  private publish(options?: SelectItemOptions) {
    this.selectedArray.length = 0;
    this.selectedArray.push(...Array.from(this.selectedHashMap.values()));
    if (false !== options?.emitEvent) {
      const changes = {
        count: this.selectionCount,
        items: Array.from(this.selectedArray.values()),
        value: this.selectedItemValues,
        text: this.toString(),
        emit: options?.emitViewToModelChange !== false,
      };
      this.valueChangesSubject.next({ ...changes, hash: hash(changes, { encoding: 'hex' }) });
    }
  }
}
