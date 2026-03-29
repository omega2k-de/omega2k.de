import { ApplicationConfig, ErrorHandler, inject, Injectable, isDevMode } from '@angular/core';
import { LoggerService } from '../logger';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  private logger: LoggerService = inject(LoggerService);

  private readonly isDevMode: boolean = isDevMode();

  handleError(error: unknown): void {
    const normalized = (() => {
      if (error instanceof Error) {
        return error;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        return new Error((error as { message: string }).message);
      }

      if (typeof error === 'string') {
        return new Error(error);
      }

      return new Error('Unknown runtime error');
    })();

    this.logger.error(normalized.message, 'ErrorHandlerService', {
      stack: normalized.stack,
      raw: error,
    });

    if (this.isDevMode) {
      throw normalized;
    }
  }
}

export const provideErrorHandler = (): ApplicationConfig['providers'] => [
  {
    provide: ErrorHandler,
    useClass: ErrorHandlerService,
  },
];
