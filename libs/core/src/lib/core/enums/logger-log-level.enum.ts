export type LoggerLogLevels = keyof typeof LoggerLogLevel;

export const LoggerLogLevel: {
  OFF: 'OFF';
  DEBUG: 'DEBUG';
  LOG: 'LOG';
  INFO: 'INFO';
  WARN: 'WARN';
  ERROR: 'ERROR';
} = {
  OFF: 'OFF',
  DEBUG: 'DEBUG',
  LOG: 'LOG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

export const LoggerLevelBitmask: {
  OFF: 0;
  DEBUG: 1;
  LOG: 2;
  INFO: 4;
  WARN: 8;
  ERROR: 16;
} = {
  OFF: 0,
  DEBUG: 1,
  LOG: 2,
  INFO: 4,
  WARN: 8,
  ERROR: 16,
};
