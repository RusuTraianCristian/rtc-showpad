import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserData, UserPokemonData } from '../core/models/pokemon.model';

/**
 * UserService handles all user data operations
 * This service abstracts localStorage operations and mimics API behavior
 * with observables, making it easy to replace with real API calls later
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'pokedex_user_data';

  /**
   * Get user data from storage
   * Returns observable to mimic API behavior
   */
  getUserData(): Observable<UserData | null> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);

      if (!storedData) {
        return of(null).pipe(delay(300)); // Simulate network delay
      }

      const parsed = JSON.parse(storedData) as UserData;
      if (!this.isValidUserData(parsed)) {
        console.warn('Invalid user data structure in localStorage');
        return of(null).pipe(delay(300));
      }

      return of(parsed).pipe(delay(300));
    } catch (error) {
      console.error('Failed to read user data from localStorage:', error);
      return throwError(() => new Error('Failed to load user data'));
    }
  }

  /**
   * Save user data to storage
   * Returns observable to mimic API behavior
   */
  saveUserData(userData: UserData): Observable<void> {
    try {
      if (!this.isValidUserData(userData)) {
        return throwError(() => new Error('Invalid user data format'));
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      return of(void 0).pipe(delay(200)); // Simulate network delay
    } catch (error) {
      console.error('Failed to save user data to localStorage:', error);
      return throwError(() => new Error('Failed to save user data'));
    }
  }

  /**
   * Delete user data from storage
   * Returns observable to mimic API behavior
   */
  deleteUserData(): Observable<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return of(void 0).pipe(delay(200));
    } catch (error) {
      console.error('Failed to remove user data from localStorage:', error);
      return throwError(() => new Error('Failed to delete user data'));
    }
  }

  /**
   * Check if user exists in storage
   * Returns observable to mimic API behavior
   */
  userExists(): Observable<boolean> {
    return this.getUserData().pipe(
      delay(100),
      map(userData => userData !== null),
      catchError(() => of(false))
    );
  }

  /**
   * Validate user data structure
   */
  private isValidUserData(data: any): data is UserData {
    if (!data || typeof data !== 'object') {
      return false;
    }
    if (!data.name || typeof data.name !== 'string') {
      return false;
    }

    if (!data.pokemons || typeof data.pokemons !== 'object') {
      return false;
    }
    const { caught, wishlist } = data.pokemons;
    if (!Array.isArray(caught) || !Array.isArray(wishlist)) {
      return false;
    }
    const isValidPokemonArray = (arr: any[]) => {
      return arr.every(pokemon =>
        pokemon &&
        typeof pokemon.id === 'number' &&
        typeof pokemon.name === 'string'
      );
    };

    return isValidPokemonArray(caught) && isValidPokemonArray(wishlist);
  }
}
