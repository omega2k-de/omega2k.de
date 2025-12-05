import { InjectionToken } from '@angular/core';

export const TELEMETRY_FPS = new InjectionToken<number>('Telemetry Service', {
  providedIn: 'root',
  factory: () => 15,
});
