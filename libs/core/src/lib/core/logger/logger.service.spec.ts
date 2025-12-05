import { TestBed } from '@angular/core/testing';
import mockDate from 'mockdate';
import { noop } from 'rxjs';
import { afterEach, beforeEach } from 'vitest';
import { LoggerService } from '.';
import { provideConfig } from '../tokens';
import { LoggerLogLevel, LoggerLogLevels } from '../enums';

interface LoggerSetup {
  logLevel: LoggerLogLevels;
  expected: boolean;
}

describe('LoggerService', () => {
  beforeEach(() => {
    mockDate.set(1752952580109);
  });

  afterEach(() => {
    mockDate.reset();
  });

  describe('LoggerService.debug should call console.debug', () => {
    const data: LoggerSetup[] = [
      {
        logLevel: LoggerLogLevel.OFF,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.DEBUG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.LOG,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.INFO,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.WARN,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.ERROR,
        expected: false,
      },
    ];

    it.each(data)('on log level $logLevel: $expected', ({ logLevel, expected }: LoggerSetup) => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(noop);
      const service: LoggerService = TestBed.configureTestingModule({
        providers: [provideConfig({ logger: logLevel })],
      }).inject(LoggerService);

      service.debug('LoggerService', 'some debug string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[D]', '[LoggerService]', 'some debug string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      spy.mockRestore();
    });
  });

  describe('LoggerService.log should call console.log', () => {
    const data: LoggerSetup[] = [
      {
        logLevel: LoggerLogLevel.OFF,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.DEBUG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.LOG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.INFO,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.WARN,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.ERROR,
        expected: false,
      },
    ];

    it.each(data)('on log level $logLevel: $expected', ({ logLevel, expected }: LoggerSetup) => {
      const mockDebug = vi.spyOn(console, 'debug').mockImplementation(noop);
      const spy = vi.spyOn(console, 'log').mockImplementation(noop);
      const service = TestBed.configureTestingModule({
        providers: [provideConfig({ logger: logLevel })],
      }).inject(LoggerService);

      service.log('LoggerService', 'some log string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[L]', '[LoggerService]', 'some log string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });

  describe('LoggerService.info should call console.info', () => {
    const data: LoggerSetup[] = [
      {
        logLevel: LoggerLogLevel.OFF,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.DEBUG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.LOG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.INFO,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.WARN,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.ERROR,
        expected: false,
      },
    ];

    it.each(data)('on log level $logLevel: $expected', ({ logLevel, expected }: LoggerSetup) => {
      const mockDebug = vi.spyOn(console, 'debug').mockImplementation(noop);
      const spy = vi.spyOn(console, 'info').mockImplementation(noop);
      const service = TestBed.configureTestingModule({
        providers: [provideConfig({ logger: logLevel })],
      }).inject(LoggerService);

      service.info('LoggerService', 'some info string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[I]', '[LoggerService]', 'some info string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });

  describe('LoggerService.warn should call console.warn', () => {
    const data: LoggerSetup[] = [
      {
        logLevel: LoggerLogLevel.OFF,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.DEBUG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.LOG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.INFO,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.WARN,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.ERROR,
        expected: false,
      },
    ];

    it.each(data)('on log level $logLevel: $expected', ({ logLevel, expected }: LoggerSetup) => {
      const mockDebug = vi.spyOn(console, 'debug').mockImplementation(noop);
      const spy = vi.spyOn(console, 'warn').mockImplementation(noop);
      const service = TestBed.configureTestingModule({
        providers: [provideConfig({ logger: logLevel })],
      }).inject(LoggerService);

      service.warn('LoggerService', 'some warn string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[W]', '[LoggerService]', 'some warn string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });

  describe('LoggerService.error should call console.error', () => {
    const data: LoggerSetup[] = [
      {
        logLevel: LoggerLogLevel.OFF,
        expected: false,
      },
      {
        logLevel: LoggerLogLevel.DEBUG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.LOG,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.INFO,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.WARN,
        expected: true,
      },
      {
        logLevel: LoggerLogLevel.ERROR,
        expected: true,
      },
    ];

    it.each(data)('on log level $logLevel: $expected', ({ logLevel, expected }: LoggerSetup) => {
      const mockDebug = vi.spyOn(console, 'debug').mockImplementation(noop);
      const spy = vi.spyOn(console, 'error').mockImplementation(noop);
      const service = TestBed.configureTestingModule({
        providers: [provideConfig({ logger: logLevel })],
      }).inject(LoggerService);

      service.error('LoggerService', 'some error string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[E]', '[LoggerService]', 'some error string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });
});
