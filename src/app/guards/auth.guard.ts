import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  // Initialize user state if not already done
  if (!appState.userLoading() && !appState.hasUser() && appState.userName() === null) {
    appState.initializeUserState();
  }

  // If still loading, allow navigation but the component will handle the loading state
  if (appState.userLoading()) {
    return true;
  }

  // Check if user is authenticated
  if (appState.hasUser()) {
    return true;
  }

  // If no user found, redirect to dashboard overview (where user modal will show)
  console.log('No user found, redirecting to dashboard overview');
  router.navigate(['/dashboard']);
  return false;
};
