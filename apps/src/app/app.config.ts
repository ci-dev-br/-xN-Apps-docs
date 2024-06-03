import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthorizationHttpInterceptor } from '@ci/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      // DI-based interceptors must be explicitly enabled.
      // withInterceptorsFromDi(),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationHttpInterceptor, multi: true },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })]
};
