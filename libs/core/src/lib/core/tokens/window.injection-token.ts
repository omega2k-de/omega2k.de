import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window | undefined>('Global window object', {
  providedIn: 'root',
  factory: () => ('undefined' === typeof window ? undefined : window),
});
