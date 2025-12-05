import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withJsonpSupport,
  withXsrfConfiguration,
} from '@angular/common/http';
import {
  ApplicationConfig,
  CSP_NONCE,
  importProvidersFrom,
  inject,
  isDevMode,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
  withIncrementalHydration,
} from '@angular/platform-browser';
import {
  provideRouter,
  TitleStrategy,
  UrlSerializer,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import {
  APP_CONFIG,
  CoordinatorService,
  DeviceNotifyService,
  HttpCachingInterceptorFn,
  LoadingInterceptorFn,
  LOCAL_STORAGE_ENCRYPTION_KEY,
  NetworkService,
  PrimaryOnlyUrlSerializer,
  provideConfig,
  provideErrorHandler,
  provideRequestCache,
  PwaUpdateService,
  ScrollPositionService,
  SeoStrategy,
} from '@o2k/core';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideConfig(APP_CONFIG),
    {
      provide: LOCAL_STORAGE_ENCRYPTION_KEY,
      useValue: isDevMode() ? null : 'Ui61s7Cp6XExjgQ6NJxIxS3YwUPuSA1U',
    },
    { provide: TitleStrategy, useClass: SeoStrategy },
    { provide: LOCALE_ID, useValue: 'de-DE' },
    { provide: CSP_NONCE, useValue: APP_CONFIG.nonce },
    importProvidersFrom(ScrollingModule),
    // @todo https://www.djamware.com/post/5bd2dce880aca70a40ccc401/angular-20-tutorial-create-a-virtual-scroll-with-angular-material-cdk
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({ includeHeaders: ['Authorization'] }),
      withIncrementalHydration()
    ),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({ paramsInheritanceStrategy: 'always', onSameUrlNavigation: 'reload' }),
      withPreloading(QuicklinkStrategy)
    ),
    { provide: UrlSerializer, useClass: PrimaryOnlyUrlSerializer },
    provideAppInitializer(() => inject(ScrollPositionService).enable()),
    provideAppInitializer(() => inject(CoordinatorService).enable()),
    provideAppInitializer(() => inject(NetworkService).enable()),
    provideAppInitializer(() => inject(PwaUpdateService).enable()),
    provideAppInitializer(() => inject(DeviceNotifyService).init()),
    provideRequestCache(),
    provideHttpClient(
      withJsonpSupport(),
      withFetch(),
      withXsrfConfiguration({ cookieName: 'X-XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([LoadingInterceptorFn, HttpCachingInterceptorFn])
    ),
    provideErrorHandler(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWithDelay:30000',
    }),
  ],
};
