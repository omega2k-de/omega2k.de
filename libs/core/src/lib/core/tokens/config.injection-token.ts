import { ApplicationConfig, InjectionToken } from '@angular/core';
import { APP_CONFIG } from '../config/app.config-params';
import { ConfigInterface } from '../interfaces/config.interface';

export const CONFIG = new InjectionToken<ConfigInterface>('Provide configuration', {
  providedIn: 'root',
  factory: () => APP_CONFIG,
});

export const provideConfig = (
  config?: Partial<ConfigInterface>
): ApplicationConfig['providers'] => [
  {
    provide: CONFIG,
    useValue: { ...APP_CONFIG, ...config },
  },
];
