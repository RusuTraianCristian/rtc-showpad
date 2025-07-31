import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AppStateService } from './services/app-state.service';

import { routes } from './app.routes';

/**
 * Factory function for APP_INITIALIZER
 */
function initializeApp(appStateService: AppStateService) {
  return () => appStateService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideQueryClient(new QueryClient()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppStateService],
      multi: true
    }
  ]
};
