import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';
import { provideConfig } from '../tokens';
import { LoggerLogLevel } from '../enums/logger-log-level.enum';
import { vi } from 'vitest';
import { noop } from 'rxjs';

interface LogWindow extends Window {
  logLevel: keyof typeof LoggerLogLevel;
}

describe('LoggerService log levels', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function make(level: keyof typeof LoggerLogLevel) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [...provideConfig({ logger: level })],
    });
    return TestBed.inject(LoggerService);
  }

  it('WARN allows warn/error but not debug/log/info', () => {
    const svc = make(LoggerLogLevel.WARN);
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => noop());
    const spyLog = vi.spyOn(console, 'log').mockImplementation(() => noop());
    const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => noop());
    const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => noop());
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => noop());

    svc.debug('T', 1);
    svc.log('T', 2);
    svc.info('T', 3);
    svc.warn('T', 4);
    svc.error('T', 5);

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).toHaveBeenCalledTimes(1);
    expect(spyError).toHaveBeenCalledTimes(1);
  });

  it('ERROR only allows error', () => {
    const svc = make(LoggerLogLevel.ERROR);
    const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => noop());
    const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => noop());
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => noop());

    svc.info('T');
    svc.warn('T');
    svc.error('T');

    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).toHaveBeenCalledTimes(1);
  });

  it('Check extended window object', () => {
    const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => noop());
    const svc = make(LoggerLogLevel.OFF);
    svc.info('T', 1);

    expect(spyInfo).not.toHaveBeenCalled();
    expect((window as unknown as LogWindow).logLevel).toStrictEqual('OFF');
    (window as unknown as LogWindow).logLevel = 'ERROR';
    expect((window as unknown as LogWindow).logLevel).toStrictEqual('ERROR');
  });
});
