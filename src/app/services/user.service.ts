import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'pokedex_user';
  private userNameSignal = signal<string | null>(this.getUserFromStorage());

  // Public readonly signal for components to subscribe to
  readonly userName = this.userNameSignal.asReadonly();

  /**
   * Sets the user name and saves it to local storage
   * @param name - The user's name to store
   */
  setUser(name: string): void {
    if (!name?.trim()) {
      throw new Error('User name cannot be empty');
    }

    const trimmedName = name.trim();
    this.saveUserToStorage(trimmedName);
    this.userNameSignal.set(trimmedName);
  }

  /**
   * Gets the current user name
   * @returns The user's name or null if no user is set
   */
  getUser(): string | null {
    return this.userNameSignal();
  }

  /**
   * Checks if a user is currently set
   * @returns True if a user exists, false otherwise
   */
  hasUser(): boolean {
    return this.userNameSignal() !== null;
  }

  /**
   * Removes the user from local storage and resets the signal
   */
  clearUser(): void {
    this.removeUserFromStorage();
    this.userNameSignal.set(null);
  }

  /**
   * Reads user from local storage
   * @private
   */
  private getUserFromStorage(): string | null {
    try {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      return storedUser && storedUser.trim() ? storedUser.trim() : null;
    } catch (error) {
      console.warn('Failed to read user from localStorage:', error);
      return null;
    }
  }

  /**
   * Saves user to local storage
   * @private
   */
  private saveUserToStorage(name: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, name);
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
      throw new Error('Unable to save user data');
    }
  }

  /**
   * Removes user from local storage
   * @private
   */
  private removeUserFromStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove user from localStorage:', error);
    }
  }
}
