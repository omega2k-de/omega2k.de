import { InjectionToken } from '@angular/core';

export const NAVIGATOR = new InjectionToken<Navigator | undefined>('Global navigator object', {
  providedIn: 'root',
  factory: () => ('undefined' === typeof navigator ? undefined : navigator),
});
