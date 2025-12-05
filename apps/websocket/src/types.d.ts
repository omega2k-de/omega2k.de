import { LoggerLogLevels } from '@o2k/core';

declare const process: {
  env: {
    VERSION?: string;
    PORT?: string;
    HOST?: string;
    LOGGER?: LoggerLogLevels;
    SOCKET?: string | null;
    API?: string | null;
    SSL?: 'true' | 'false';
  };
};
