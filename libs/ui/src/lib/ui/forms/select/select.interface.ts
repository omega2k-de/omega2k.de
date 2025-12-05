export type UiSelectFormValue<T extends SelectObject> = T | T[] | null | string;
export type UiSelectValue<T extends SelectObject> = UiOption<T> | UiOption<T>[] | null;

export type UiSelectInputType =
  | 'text'
  | 'search'
  | 'email'
  | 'number'
  | 'password'
  | 'tel'
  | 'url'
  | 'file'
  | 'month'
  | 'time'
  | 'week'
  | 'datetime-local'
  | 'date';
export type UiSelectInputMode = 'select' | 'input' | 'auto';
export type UiSelectInputOpen = boolean | 'force';
export type UiSelectInputSorting<T extends SelectObject> = 'natural' | 'off' | SortingFn<T>;

export interface UiSelectInputMultiselect {
  showCount?: boolean; // default: true
  prefix?: string; // default: ''
  separator?: string; // default: ', '
  suffix?: string; // default: ''
}

export interface SelectComponentOptions<T extends SelectObject> {
  label?: string;
  type?: UiSelectInputType; // default: 'text'
  sorting?: UiSelectInputSorting<T>; // default: 'natural'
  mode?: UiSelectInputMode; // default: 'input'
  showAll?: boolean; // default: false
  autocomplete?: AutoFill | 'one-time-code'; // default: 'one-time-code'
  multiselect?: UiSelectInputMultiselect;
  factory?: SelectOptionFactoryFn<T>; // optional (allow to create)
  open?: UiSelectInputOpen; // default: false
  itemHeightPx?: number; // default: 44
  displayItems?: number; // default: 5
}

export interface SelectItemOptions {
  emitEvent?: boolean;
  emitViewToModelChange?: boolean;
}

export type BadgeAction = 'clear';

export type SelectObject = object & SelectOption;
export type SelectOptionFactoryFn<T> = (label: string) => T;

export type SortingFn<T> = (b: T, a: T) => number;

export interface SelectOption {
  label: string;
}

export interface SelectOptionAutocomplete extends SelectOption {
  value: string | null;
}

export interface UiOption<T extends SelectObject> {
  hash: string;
  label: string;
  item: T;
  created?: boolean;
  selected?: boolean;
  matching?: boolean;
}

export interface SelectedData<T extends SelectObject> {
  items: UiOption<T>[];
  count: number;
  value: UiSelectFormValue<T>;
  text: string;
  emit: boolean;
  hash: string | null;
}

export type SelectionCursor<T extends SelectObject> = UiOption<T> | null;

export interface Cursor<T extends SelectObject> {
  first: SelectionCursor<T>;
  prevPage: SelectionCursor<T>;
  prev: SelectionCursor<T>;
  curr: SelectionCursor<T>;
  next: SelectionCursor<T>;
  nextPage: SelectionCursor<T>;
  last: SelectionCursor<T>;
  hash?: string;
}
