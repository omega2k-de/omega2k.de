import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { ErrorHandlerService } from '.';
import { LoggerService } from '../logger';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  const loggerMock: Partial<LoggerService> = {
    error: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(LoggerService, loggerMock)],
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#handleError should log error', () => {
    const error = new Error('custom error');
    try {
      service.handleError(error);
    } catch (e) {
      expect(e).toStrictEqual(error);
    }

    expect(loggerMock.error).toHaveBeenCalledWith(error.message, 'ErrorHandlerService', {
      stack: error.stack,
    });
  });
});
