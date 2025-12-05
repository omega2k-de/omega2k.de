/* eslint-disable no-console */
import { noop } from 'rxjs';
import { LoggerLevelBitmask, LoggerLogLevel, LoggerLogLevels } from '../enums';

declare type ConsoleCallback = (context: string, ...data: unknown[]) => void;

interface LogLevelData {
  level: LoggerLogLevels;
  bitmask: number;
}

export class LoggerBaseService {
  protected currentLevel: LoggerLogLevels = 'DEBUG';
  protected readonly logLevels: LogLevelData[] = [
    {
      level: LoggerLogLevel.OFF,
      bitmask: LoggerLevelBitmask.OFF,
    },
    {
      level: LoggerLogLevel.DEBUG,
      bitmask:
        LoggerLevelBitmask.DEBUG |
        LoggerLevelBitmask.LOG |
        LoggerLevelBitmask.INFO |
        LoggerLevelBitmask.WARN |
        LoggerLevelBitmask.ERROR,
    },
    {
      level: LoggerLogLevel.LOG,
      bitmask:
        LoggerLevelBitmask.LOG |
        LoggerLevelBitmask.INFO |
        LoggerLevelBitmask.WARN |
        LoggerLevelBitmask.ERROR,
    },
    {
      level: LoggerLogLevel.INFO,
      bitmask: LoggerLevelBitmask.INFO | LoggerLevelBitmask.WARN | LoggerLevelBitmask.ERROR,
    },
    {
      level: LoggerLogLevel.WARN,
      bitmask: LoggerLevelBitmask.WARN | LoggerLevelBitmask.ERROR,
    },
    {
      level: LoggerLogLevel.ERROR,
      bitmask: LoggerLevelBitmask.ERROR,
    },
  ];
  debug: ConsoleCallback = noop;
  log: ConsoleCallback = noop;
  info: ConsoleCallback = noop;
  warn: ConsoleCallback = noop;
  error: ConsoleCallback = noop;
  table: typeof console.table = noop;
  group: typeof console.group = noop;
  groupCollapsed: typeof console.groupCollapsed = noop;
  groupEnd: typeof console.groupEnd = noop;
  count: typeof console.count = noop;
  countReset: typeof console.countReset = noop;
  time: typeof console.time = noop;
  timeEnd: typeof console.timeEnd = noop;
  timeLog: typeof console.timeLog = noop;
  trace: typeof console.trace = noop;
  profile: typeof console.profile = noop;
  profileEnd: typeof console.profileEnd = noop;
  timeStamp: typeof console.timeStamp = noop;

  get logLevel() {
    return this.currentLevel;
  }

  set logLevel(logLevel: LoggerLogLevels) {
    this.currentLevel = logLevel;
    const data = this.logLevels.find(level => level.level === logLevel);
    if (data?.bitmask) {
      if ((data.bitmask & LoggerLevelBitmask.DEBUG) === LoggerLevelBitmask.DEBUG) {
        this.mapConsoleDefaults();
        this.debug = (context: string, ...data: unknown[]) =>
          console.debug('[D]', `[${context}]`, ...data);
      }
      if ((data.bitmask & LoggerLevelBitmask.LOG) === LoggerLevelBitmask.LOG) {
        this.log = (context: string, ...data: unknown[]) =>
          console.log('[L]', `[${context}]`, ...data);
      }
      if ((data.bitmask & LoggerLevelBitmask.INFO) === LoggerLevelBitmask.INFO) {
        this.info = (context: string, ...data: unknown[]) =>
          console.info('[I]', `[${context}]`, ...data);
      }
      if ((data.bitmask & LoggerLevelBitmask.WARN) === LoggerLevelBitmask.WARN) {
        this.warn = (context: string, ...data: unknown[]) =>
          console.warn('[W]', `[${context}]`, ...data);
      }
      if ((data.bitmask & LoggerLevelBitmask.ERROR) === LoggerLevelBitmask.ERROR) {
        this.error = (context: string, ...data: unknown[]) =>
          console.error('[E]', `[${context}]`, ...data);
      }
    }
  }

  private mapConsoleDefaults() {
    this.count = console.count;
    this.countReset = console.countReset;
    this.group = console.group;
    this.groupEnd = console.groupEnd;
    this.groupCollapsed = console.groupCollapsed;
    this.table = console.table;
    this.time = console.time;
    this.timeEnd = console.timeEnd;
    this.timeLog = console.timeLog;
    this.trace = console.trace;
    this.profile = console.profile;
    this.profileEnd = console.profileEnd;
    this.timeStamp = console.timeStamp;
  }
}
