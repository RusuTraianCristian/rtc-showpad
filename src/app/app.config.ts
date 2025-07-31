import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AppStateService } from './services/app-state.service';
import { errorInterceptor } from './interceptors/error.interceptor';

import { routes } from './app.routes';

function initializeApp(appStateService: AppStateService) {
  return () => appStateService.initialize();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        if (error?.status === 401 || error?.status === 403) return false;
        if (error?.status >= 400 && error?.status < 500) return failureCount < 1;
        if (error?.status >= 500) return failureCount < 3;
        if (error?.isNetworkError || error?.name === 'NetworkError') return failureCount < 3;
        if (error?.status === 0) return failureCount < 3;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        if (error?.isNetworkError) return failureCount < 2;
        return failureCount < 1;
      },
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideQueryClient(queryClient),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppStateService],
      multi: true
    }
  ]
};
