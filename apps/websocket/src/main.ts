import { WsOptions } from './interfaces';
import { WsServer } from './services';
import webpush from 'web-push';
import { APP_CONFIG } from '@o2k/core';
import { ContentRepository } from '@o2k/core/core/repositories/content.repository';
import { LikesRepository } from '@o2k/core/core/repositories/likes.repository';

const { ssl, logger, api_host, api_port, url, version, hash } = APP_CONFIG;
const options: WsOptions = {
  ssl,
  logger,
  host: api_host,
  port: api_port,
  origin: url,
  version,
  hash,
};

if (process.env['API_PORT_OVERRIDE']) {
  options.port = parseInt(process.env['API_PORT_OVERRIDE']);
}

if (process.env['VAPID_PUBLIC_KEY'] && process.env['VAPID_PRIVATE_KEY']) {
  webpush.setVapidDetails(
    'mailto:root@omega2k.de',
    process.env['VAPID_PUBLIC_KEY'],
    process.env['VAPID_PRIVATE_KEY']
  );
}

async function bootstrap() {
  const contentRepo = await ContentRepository.create();
  const likesRepo = await LikesRepository.create();
  const server = new WsServer(options, contentRepo, likesRepo);
  server.listen();
}

bootstrap();
