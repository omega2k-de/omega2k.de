import { ApplicationConfig, isDevMode, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { APP_CONFIG, provideConfig } from '@o2k/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

export function resolveServerApiBaseUrl(): string {
  const internalApi = process.env['API_INTERNAL_URL']?.trim();
  if (internalApi) {
    return internalApi.replace(/\/+$/g, '');
  }

  if (isDevMode()) {
    return `https://localhost:${APP_CONFIG.api_port}`;
  }

  return APP_CONFIG.api.replace(/https/, 'http').replace(/\/+$/g, '');
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideConfig(
      isDevMode()
        ? { logger: 'INFO', api: resolveServerApiBaseUrl() }
        : { logger: 'ERROR', api: resolveServerApiBaseUrl() }
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
