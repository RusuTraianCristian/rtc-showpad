import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserPokemon, UserPokemonData, UserData } from '../core/models/pokemon.model';
import { UserService } from './user.service';

export interface AppState {
  user: {
    name: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    pokemons: UserPokemonData;
  };
}

/**
 * AppStateService manages application state using Angular signals
 * This service focuses purely on state management and delegates data operations to services
 */
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private userService = inject(UserService);
  private readonly defaultPokemonData: UserPokemonData = {
    caught: [],
    wishlist: []
  };
  private userNameSignal = signal<string | null>(null);
  private userLoadingSignal = signal<boolean>(false);
  private userInitializedSignal = signal<boolean>(false);
  private userPokemonSignal = signal<UserPokemonData>(this.defaultPokemonData);
  readonly userName = this.userNameSignal.asReadonly();
  readonly userLoading = this.userLoadingSignal.asReadonly();
  readonly userInitialized = this.userInitializedSignal.asReadonly();
  readonly userPokemons = this.userPokemonSignal.asReadonly();
  readonly hasUser = computed(() => this.userNameSignal() !== null);
  readonly caughtPokemonCount = computed(() => this.userPokemonSignal().caught.length);
  readonly wishlistPokemonCount = computed(() => this.userPokemonSignal().wishlist.length);
  readonly userState = computed(() => ({
    name: this.userNameSignal(),
    isLoading: this.userLoadingSignal(),
    isInitialized: this.userInitializedSignal(),
    hasUser: this.hasUser(),
    pokemons: this.userPokemonSignal(),
    stats: {
      caughtCount: this.caughtPokemonCount(),
      wishlistCount: this.wishlistPokemonCount()
    }
  }));

  constructor() {
    effect(() => {
      const userName = this.userNameSignal();
      const pokemonData = this.userPokemonSignal();

      if (userName !== null) {
        const userData: UserData = { name: userName, pokemons: pokemonData };
        this.userService.saveUserData(userData).subscribe({
          next: () => {},
          error: (error) => console.error('Failed to sync user data:', error)
        });
      }
    });
  }

  /**
   * Initialize user state - called once on app startup
   * Uses UserService to load data
   */
  async initialize(): Promise<void> {
    if (this.userInitializedSignal()) {
      return;
    }

    this.userLoadingSignal.set(true);

    try {
      const userData = await firstValueFrom(this.userService.getUserData());

      if (userData) {
        this.userNameSignal.set(userData.name);
        this.userPokemonSignal.set(userData.pokemons);
      } else {
        this.userNameSignal.set(null);
        this.userPokemonSignal.set(this.defaultPokemonData);
      }

      this.userInitializedSignal.set(true);
    } catch (error) {
      console.error('Error initializing user state:', error);
      this.userNameSignal.set(null);
      this.userPokemonSignal.set(this.defaultPokemonData);
      this.userInitializedSignal.set(true);
    } finally {
      this.userLoadingSignal.set(false);
    }
  }

  /**
   * Set user name and initialize Pokemon data
   */
  setUser(name: string): void {
    if (!name?.trim()) {
      throw new Error('User name cannot be empty');
    }

    const trimmedName = name.trim();
    this.userNameSignal.set(trimmedName);
    this.userPokemonSignal.set(this.defaultPokemonData);
  }

  /**
   * Clear user from state and storage
   */
  clearUser(): void {
    this.userNameSignal.set(null);
    this.userPokemonSignal.set(this.defaultPokemonData);

    this.userService.deleteUserData().subscribe({
      next: () => {},
      error: (error) => console.error('Failed to clear user data:', error)
    });
  }

  /**
   * Add Pokemon to caught list
   */
  addCaughtPokemon(pokemon: UserPokemon): void {
    const currentData = this.userPokemonSignal();
    const isAlreadyCaught = currentData.caught.some(p => p.id === pokemon.id);

    if (!isAlreadyCaught) {
      this.userPokemonSignal.set({
        ...currentData,
        caught: [...currentData.caught, pokemon],
        wishlist: currentData.wishlist.filter(p => p.id !== pokemon.id)
      });
    }
  }

  /**
   * Remove Pokemon from caught list
   */
  removeCaughtPokemon(pokemonId: number): void {
    const currentData = this.userPokemonSignal();
    this.userPokemonSignal.set({
      ...currentData,
      caught: currentData.caught.filter(p => p.id !== pokemonId)
    });
  }

  /**
   * Add Pokemon to wishlist
   */
  addToWishlist(pokemon: UserPokemon): void {
    const currentData = this.userPokemonSignal();
    const isAlreadyInWishlist = currentData.wishlist.some(p => p.id === pokemon.id);
    const isAlreadyCaught = currentData.caught.some(p => p.id === pokemon.id);

    if (!isAlreadyInWishlist && !isAlreadyCaught) {
      this.userPokemonSignal.set({
        ...currentData,
        wishlist: [...currentData.wishlist, pokemon]
      });
    }
  }

  /**
   * Remove Pokemon from wishlist
   */
  removeFromWishlist(pokemonId: number): void {
    const currentData = this.userPokemonSignal();
    this.userPokemonSignal.set({
      ...currentData,
      wishlist: currentData.wishlist.filter(p => p.id !== pokemonId)
    });
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use initialize() instead
   */
  initializeUserState(): void {
    this.initialize();
  }
}
