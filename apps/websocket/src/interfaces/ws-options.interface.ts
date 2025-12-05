import { LoggerLogLevels } from '@o2k/core';

export interface WsOptions {
  ssl?: boolean;
  logger?: LoggerLogLevels;
  origin: string;
  host: string;
  port: number;
  version: string;
  hash: string | null;
}
