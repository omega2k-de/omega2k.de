import { ConfigInterface } from '../interfaces/config.interface';

export const APP_CONFIG: ConfigInterface = {
  ssl: true,
  version: '0.42.86',
  ssr_port: 4200,
  ssr_host: 'www.omega2k.de.o2k',
  api_port: 42080,
  api_host: 'api.omega2k.de.o2k',
  logger: 'DEBUG',
  socket: 'wss://api.omega2k.de.o2k:42080',
  api: 'https://api.omega2k.de.o2k:42080',
  url: 'https://www.omega2k.de.o2k:4200',
  hash: null,
  nonce: null,
  wsServer: {
    ping: 1_000,
    heartbeat: 5_000,
    health: 10_000,
    fps: 15,
  },
};
