import { inject, Injectable, NgZone } from '@angular/core';
import { CONFIG } from '../tokens';
import { LoggerBaseService } from './logger.base.service';
import { LoggerLogLevels } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class LoggerService extends LoggerBaseService {
  constructor() {
    super();
    const zone = inject(NgZone);
    const config = inject(CONFIG);
    this.logLevel = config.logger ?? 'DEBUG';

    const setter = (loggerLevel: LoggerLogLevels) => {
      this.logLevel = loggerLevel;
    };
    const getter = () => this.logLevel;

    if (typeof window !== 'undefined') {
      zone.runOutsideAngular(() => {
        Object.defineProperty(window, 'logLevel', {
          get: getter,
          set: setter,
          configurable: true,
          enumerable: true,
        });
      });
    }
  }
}
