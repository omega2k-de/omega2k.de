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

export function resolveServerLoggerLevel(): 'OFF' | 'DEBUG' | 'LOG' | 'INFO' | 'WARN' | 'ERROR' {
  const runtimeLevel = (process.env['SSR_LOG_LEVEL'] ?? process.env['COMPOSE_LOGGER'])?.trim();
  const normalized = runtimeLevel?.toUpperCase();
  switch (normalized) {
    case 'OFF':
    case 'DEBUG':
    case 'LOG':
    case 'INFO':
    case 'WARN':
    case 'ERROR':
      return normalized;
    default:
      return isDevMode() ? 'INFO' : 'ERROR';
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideConfig({ logger: resolveServerLoggerLevel(), api: resolveServerApiBaseUrl() }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
