import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const appState = inject(AppStateService);
  const router = inject(Router);
  if (!appState.userLoading() && !appState.hasUser() && appState.userName() === null) {
    appState.initializeUserState();
  }
  if (appState.userLoading()) {
    return true;
  }
  if (appState.hasUser()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
