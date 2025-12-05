import { ApplicationConfig, ErrorHandler, inject, Injectable, isDevMode } from '@angular/core';
import { LoggerService } from '../logger';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  private logger: LoggerService = inject(LoggerService);

  private readonly isDevMode: boolean = isDevMode();

  handleError(error: Error): void {
    this.logger.error(error.message, 'ErrorHandlerService', {
      stack: error.stack,
    });

    if (this.isDevMode) {
      throw error;
    }
  }
}

export const provideErrorHandler = (): ApplicationConfig['providers'] => [
  {
    provide: ErrorHandler,
    useClass: ErrorHandlerService,
  },
];
