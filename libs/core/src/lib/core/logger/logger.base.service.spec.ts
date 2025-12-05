import mockDate from 'mockdate';
import { noop } from 'rxjs';
import { afterEach, beforeEach } from 'vitest';
import { LoggerLogLevel, LoggerLogLevels } from '../enums';
import { LoggerBaseService } from './';

interface LoggerSetup {
  logLevel: LoggerLogLevels;
  expected: boolean;
}

describe('LoggerBaseService', () => {
  beforeEach(() => {
    mockDate.set(1752952580109);
  });

  afterEach(() => {
    mockDate.reset();
  });

  describe('LoggerBaseService.debug should call console.debug', () => {
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
      const service = new LoggerBaseService();
      service.logLevel = logLevel;

      service.debug('LoggerBaseService', 'some debug string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[D]', '[LoggerBaseService]', 'some debug string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      expect(service.logLevel).toStrictEqual(logLevel);
      spy.mockRestore();
    });
  });

  describe('LoggerBaseService.log should call console.log', () => {
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
      const service = new LoggerBaseService();
      service.logLevel = logLevel;

      service.log('LoggerBaseService', 'some log string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[L]', '[LoggerBaseService]', 'some log string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      expect(service.logLevel).toStrictEqual(logLevel);
      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });

  describe('LoggerBaseService.info should call console.info', () => {
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
      const service = new LoggerBaseService();
      service.logLevel = logLevel;

      service.info('LoggerBaseService', 'some info string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[I]', '[LoggerBaseService]', 'some info string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      expect(service.logLevel).toStrictEqual(logLevel);
      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });

  describe('LoggerBaseService.warn should call console.warn', () => {
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
      const service = new LoggerBaseService();
      service.logLevel = logLevel;

      service.warn('LoggerBaseService', 'some warn string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[W]', '[LoggerBaseService]', 'some warn string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      expect(service.logLevel).toStrictEqual(logLevel);
      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });

  describe('LoggerBaseService.error should call console.error', () => {
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
      const service = new LoggerBaseService();
      service.logLevel = logLevel;

      service.error('LoggerBaseService', 'some error string');

      if (expected) {
        expect(spy).toHaveBeenNthCalledWith(1, '[E]', '[LoggerBaseService]', 'some error string');
      } else {
        expect(spy).not.toHaveBeenCalled();
      }

      expect(service.logLevel).toStrictEqual(logLevel);
      spy.mockRestore();
      mockDebug.mockRestore();
    });
  });
});
