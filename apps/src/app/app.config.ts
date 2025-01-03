import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthorizationHttpInterceptor, CoreModule, coreProvider, StorageService } from '@ci/core';
import { ApiModule } from '@ci/portal-api';
import { provideNuMonacoEditorConfig } from '@ng-util/monaco-editor';

const SETUP = {
  API_URL_GATEWAY: 'https://apps.ci.dev.br:446',
  ALTERN_GATEWAYS: [
    'https://srv33.internals.ci.dev.br:664',
    'https://lorelei.ci.dev.br'
  ],
  UNSATLY_WS_COMMON: 'ws://apps.ci.dev.br:87',
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideNuMonacoEditorConfig({
      baseUrl: `lib`,
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ...(ApiModule.forRoot(
      {
        rootUrl: SETUP.API_URL_GATEWAY,
      }).providers as []),
    StorageService,
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationHttpInterceptor, multi: true }, provideAnimationsAsync(),
    coreProvider({
      gateway: SETUP.UNSATLY_WS_COMMON,
      rootApi: SETUP.API_URL_GATEWAY,
      alternativeApiGateways: SETUP.ALTERN_GATEWAYS,
    }),
  ],
};
