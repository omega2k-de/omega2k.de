import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@o2k/core';
import hash from 'object-hash';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { ConfigService, SelectionService } from '.';
import { Cursor, SelectedData, SelectionCursor, SelectObject, UiOption } from '..';

type SelectionChanges<T extends SelectObject> = [string, SelectedData<T> | null, UiOption<T>[]];

@Injectable()
export class ItemsService<T extends SelectObject> {
  private readonly searchStringSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private uiOptions: UiOption<T>[] = [];
  private allUiOptions: UiOption<T>[] = [];
  private readonly allUiOptionsSubject: BehaviorSubject<UiOption<T>[]> = new BehaviorSubject<
    UiOption<T>[]
  >(this.allUiOptions);
  private readonly uiOptionsSubject = new BehaviorSubject<UiOption<T>[]>([]);
  private selectionS: SelectionService<T> = inject(SelectionService<T>, { self: false });
  private configS: ConfigService<T> = inject(ConfigService<T>, { self: false });
  private logger: LoggerService = inject(LoggerService);
  private readonly _cursor: Cursor<T> = {
    first: null,
    curr: null,
    next: null,
    prev: null,
    nextPage: null,
    prevPage: null,
    last: null,
  };
  private _cursorSubject: BehaviorSubject<Cursor<T>> = new BehaviorSubject<Cursor<T>>(this._cursor);
  public readonly searchString$: Observable<string> = this.searchStringSubject.asObservable();
  public readonly uiOptions$: Observable<UiOption<T>[]> = this.uiOptionsSubject.asObservable();
  readonly cursor$: Observable<Cursor<T>> = this._cursorSubject.asObservable();

  constructor() {
    combineLatest([
      this.searchString$.pipe(distinctUntilChanged((a, b) => a === b)),
      this.selectionS.changes$.pipe(distinctUntilChanged((a, b) => a?.hash === b?.hash)),
      this.allUiOptionsSubject.asObservable(),
    ])
      .pipe(
        map(([searchString, selectionChanges, uiOptions]: SelectionChanges<T>) => {
          const created = this.findInAllByLabelStrict(searchString, true);
          const options = created?.created ? [created, ...uiOptions] : uiOptions;

          this.logger.group(`OptionsService:${this.configS.name()}`, 'uiOptions$');
          this.logger.info('input', {
            searchString,
            selectionChanges,
          });

          if (
            selectionChanges?.count &&
            selectionChanges.text === searchString &&
            this.configS.showAll()
          ) {
            return this.mapSelectedOption(options);
          }

          return this.mapSelectedOption(
            options.filter(option => this.matchSearchOption(option, searchString))
          );
        }),
        tap((uiOptions: UiOption<T>[]) => {
          this.logger.info('output', { uiOptions });
          this.logger.groupEnd();
        }),
        distinctUntilChanged((a, b) => hash(a) === hash(b)),
        tap((uiOptions: UiOption<T>[]) => {
          this.uiOptions = uiOptions;
          this.updateCursor();
        })
      )
      .subscribe((uiOptions: UiOption<T>[]) => this.uiOptionsSubject.next(uiOptions));
  }

  get cursor(): Cursor<T> {
    return this._cursor;
  }

  set current(cursor: SelectionCursor<T>) {
    this.logger.debug(`OptionsService:${this.configS.name()}`, 'set current', { cursor });
    this._cursor.curr = cursor;
    this.updateCursor();
  }

  setSearchString(search: string) {
    this.logger.debug(`OptionsService:${this.configS.name()}`, 'setSearchString', { search });
    this.searchStringSubject.next(search);
  }

  setAllItems(items: T[]): UiOption<T>[] {
    const allUiOptions = items.map(item => this.transform(item));
    this.logger.debug(`OptionsService:${this.configS.name()}`, 'setItems', {
      items,
      allUiOptions,
    });

    this.allUiOptions = allUiOptions;
    this.uiOptions = this.mapSelectedOption(this.allUiOptions);
    this.allUiOptionsSubject.next(this.allUiOptions);
    return [...allUiOptions];
  }

  findInAllByValues(values: T[]) {
    return this.allUiOptions.filter(
      option => values.findIndex(value => option.hash === hash(value)) !== -1
    );
  }

  findInAllByLabelStrict(value: string, create?: true): SelectionCursor<T> {
    const label = value.trim();
    return (
      this.allUiOptions.find(option => option.label === label) ??
      (create && label.length > 0 ? this.createUiOption(label) : null)
    );
  }

  createUiOption(value: string): SelectionCursor<T> {
    const factory = this.configS.factory();
    return value.length > 0 && typeof factory === 'function'
      ? this.transform(factory(value), true)
      : null;
  }

  indexOf(cursor: SelectionCursor<T>) {
    return cursor ? this.uiOptions.findIndex(option => option.hash === cursor.hash) : -1;
  }

  getFromAllByIndex(index: number): UiOption<T> | null {
    return this.allUiOptions[index] ?? null;
  }

  getByIndex(index: number): UiOption<T> | null {
    return this.uiOptions[index] ?? null;
  }

  private mapSelectedOption(options: UiOption<T>[]): UiOption<T>[] {
    return options.map((option: UiOption<T>) => ({
      ...option,
      selected: this.selectionS.isSelected(option),
    }));
  }

  private matchSearchOption(uiOption: UiOption<T>, searchString: string): boolean {
    return 0 === searchString.length
      ? true
      : searchString.split(' ').every(word => uiOption.label.includes(word));
  }

  private hashItem = (item: T): string => hash(item, { encoding: 'hex' });

  private transform = (item: T, created?: boolean, selected = false): UiOption<T> => ({
    hash: this.hashItem(item),
    label: item.label,
    item,
    created,
    selected,
  });

  private updateCursor() {
    const perPage = Math.max(1, Math.floor(this.configS.displayItems()));
    delete this._cursor.hash;
    if (this._cursor.curr && this.indexOf(this._cursor.curr) === -1) {
      this._cursor.curr = null;
    }
    if (this._cursor.curr === null && this.uiOptions.length === 1) {
      this._cursor.curr = this.uiOptions[0] ?? null;
    }
    this._cursor.first = this.uiOptions[0] ?? null;
    this._cursor.last = this.uiOptions[this.uiOptions.length - 1] ?? null;

    if (this._cursor.curr) {
      const prevIndex = this.getIndex('prev', perPage);
      const nextIndex = this.getIndex('next', perPage);
      this._cursor.next = this.uiOptions[nextIndex] ?? null;
      this._cursor.prev = this.uiOptions[prevIndex] ?? null;
    } else if (this.uiOptions.length > 0) {
      const firstSelected = this.uiOptions.find(option => option.selected) ?? null;
      this._cursor.prev = firstSelected ?? this.uiOptions[0] ?? null;
      this._cursor.next = firstSelected ?? this.uiOptions[0] ?? null;
    }

    const prevPageIndex = this.getIndex('prevPage', perPage);
    const nextPageIndex = this.getIndex('nextPage', perPage);

    this._cursor.nextPage = this.uiOptions[nextPageIndex] ?? null;
    this._cursor.prevPage = this.uiOptions[prevPageIndex] ?? null;

    const cursor = Object.assign({ hash: hash(this._cursor, { encoding: 'hex' }) }, this._cursor);
    this.logger.info(`OptionsService:${this.configS.name()}`, 'updateCursor', cursor);
    this._cursorSubject.next(cursor);
  }

  private getIndex(key: keyof Cursor<T>, perPage: number) {
    let index = 0;
    const length = this.uiOptions.length;
    const cursor = this._cursor.curr;
    if (length > 0 && cursor) {
      const direction = key === 'prev' || key === 'prevPage' ? -1 : 1;
      const step = key === 'prev' || key === 'next' ? 1 : perPage;
      index = this.indexOf(cursor) + direction * step;
      if (direction > 0) {
        while (index >= length) {
          index = length > 0 ? index - length : 0;
        }
      } else {
        while (index < 0) {
          index = length > 0 ? index + length : 0;
        }
      }
    }
    return index;
  }
}
