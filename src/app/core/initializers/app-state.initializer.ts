import { AppStateService } from '../../services/app-state.service';

/**
 * App initializer function to set up user state on application bootstrap
 * This ensures user state is initialized once when the app starts
 */
export function initializeAppState() {
  return (appStateService: AppStateService): Promise<void> => {
    return appStateService.initialize();
  };
}
