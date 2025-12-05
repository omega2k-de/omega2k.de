import { LoggerLogLevels } from '../enums/logger-log-level.enum';

export interface ConfigInterface {
  ssl: boolean;
  ssr_port: number;
  ssr_host: string;
  api_port: number;
  api_host: string;
  redis_port: number;
  redis_host: string;
  logger: LoggerLogLevels;
  socket: string | null;
  api: string;
  url: string;
  redis: string;
  version: string;
  hash: string | null;
  nonce: string | null;
  wsServer: {
    ping: number;
    heartbeat: number;
    health: number;
    fps: number;
  };
}
