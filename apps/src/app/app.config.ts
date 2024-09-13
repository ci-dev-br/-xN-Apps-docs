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
    ...(ApiModule.forRoot({ rootUrl: 'https://apps.ci.dev.br:446' }).providers as []),
    StorageService,
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationHttpInterceptor, multi: true }, provideAnimationsAsync(),
    coreProvider({ gateway: 'ws://apps.ci.dev.br:87' }),
  ],
};
