import { ApplicationConfig, isDevMode, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { APP_CONFIG, provideConfig } from '@o2k/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideConfig(
      isDevMode()
        ? { logger: 'INFO', api: 'https://localhost:' + APP_CONFIG.api_port }
        : { logger: 'ERROR', api: APP_CONFIG.api.replace(/https/, 'http') }
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
