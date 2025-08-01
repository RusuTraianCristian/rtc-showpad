import { Injectable, signal, computed, effect } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private _isOnline = signal(navigator.onLine);

  readonly isOnline = this._isOnline.asReadonly();
  readonly isOffline = computed(() => !this._isOnline());

  constructor() {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    const networkStatus$ = merge(online$, offline$).pipe(
      startWith(navigator.onLine)
    );

    const networkSignal = toSignal(networkStatus$, { initialValue: navigator.onLine });

    effect(() => {
      const status = networkSignal();
      if (status !== undefined) {
        this._isOnline.set(status);
      }
    });
  }

  checkConnection(): Promise<boolean> {
    if (!navigator.onLine) {
      return Promise.resolve(false);
    }

    return fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache'
    })
      .then(() => true)
      .catch(() => false);
  }

  getConnectionInfo(): string {
    if (!navigator.onLine) {
      return 'No internet connection';
    }

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection) {
      return `Connected via ${connection.effectiveType || 'unknown'} (${connection.downlink || 'unknown'} Mbps)`;
    }

    return 'Connected';
  }
}
