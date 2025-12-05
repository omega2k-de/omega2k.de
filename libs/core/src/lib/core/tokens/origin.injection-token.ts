import { inject, InjectionToken, REQUEST } from '@angular/core';
import { CONFIG } from '../tokens';
import { WINDOW } from './window.injection-token';

export const ORIGIN = new InjectionToken<string>(
  'Resolved origin string by request, window or config',
  {
    providedIn: 'root',
    factory: () => {
      const request = inject(REQUEST, { optional: true });
      const window = inject(WINDOW);
      if (request?.url) {
        return new URL(request.url).origin;
      } else if (typeof window !== 'undefined' && window.location.origin) {
        return window.location.origin;
      }
      return inject(CONFIG).url;
    },
  }
);
