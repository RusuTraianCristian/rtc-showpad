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

  // Default Pokemon data structure
  private readonly defaultPokemonData: UserPokemonData = {
    caught: [],
    wishlist: []
  };

  // Private signals for state management
  private userNameSignal = signal<string | null>(null);
  private userLoadingSignal = signal<boolean>(false);
  private userInitializedSignal = signal<boolean>(false);
  private userPokemonSignal = signal<UserPokemonData>(this.defaultPokemonData);

  // Public readonly computed signals
  readonly userName = this.userNameSignal.asReadonly();
  readonly userLoading = this.userLoadingSignal.asReadonly();
  readonly userInitialized = this.userInitializedSignal.asReadonly();
  readonly userPokemons = this.userPokemonSignal.asReadonly();

  // Computed signal for user existence
  readonly hasUser = computed(() => this.userNameSignal() !== null);

  // Computed signals for Pokemon stats
  readonly caughtPokemonCount = computed(() => this.userPokemonSignal().caught.length);
  readonly wishlistPokemonCount = computed(() => this.userPokemonSignal().wishlist.length);

  // Computed signal for complete user state
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
    // Effect to sync state changes to UserService
    effect(() => {
      const userName = this.userNameSignal();
      const pokemonData = this.userPokemonSignal();

      if (userName !== null) {
        const userData: UserData = { name: userName, pokemons: pokemonData };
        this.userService.saveUserData(userData).subscribe({
          next: () => console.log('User data synced to storage'),
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
      return; // Already initialized
    }

    console.log('Initializing user state...');
    this.userLoadingSignal.set(true);

    try {
      const userData = await firstValueFrom(this.userService.getUserData());

      if (userData) {
        console.log('Found stored user data:', userData);
        this.userNameSignal.set(userData.name);
        this.userPokemonSignal.set(userData.pokemons);
      } else {
        console.log('No stored user data found');
        this.userNameSignal.set(null);
        this.userPokemonSignal.set(this.defaultPokemonData);
      }

      this.userInitializedSignal.set(true);
      console.log('User state initialized successfully');
    } catch (error) {
      console.error('Error initializing user state:', error);
      // Set default state on error
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
    console.log('Setting user in global state:', trimmedName);

    this.userNameSignal.set(trimmedName);
    // Initialize with default Pokemon data for new user
    this.userPokemonSignal.set(this.defaultPokemonData);

    console.log('User state after setting:', {
      name: this.userNameSignal(),
      hasUser: this.hasUser(),
      pokemonStats: {
        caught: this.caughtPokemonCount(),
        wishlist: this.wishlistPokemonCount()
      }
    });
  }

  /**
   * Clear user from state and storage
   */
  clearUser(): void {
    console.log('Clearing user from global state');
    this.userNameSignal.set(null);
    this.userPokemonSignal.set(this.defaultPokemonData);

    this.userService.deleteUserData().subscribe({
      next: () => console.log('User data cleared from storage'),
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
        // Remove from wishlist if it was there
        wishlist: currentData.wishlist.filter(p => p.id !== pokemon.id)
      });
      console.log('Pokemon added to caught:', pokemon.name);
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
    console.log('Pokemon removed from caught:', pokemonId);
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
      console.log('Pokemon added to wishlist:', pokemon.name);
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
    console.log('Pokemon removed from wishlist:', pokemonId);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use initialize() instead
   */
  initializeUserState(): void {
    console.warn('initializeUserState() is deprecated, use initialize() instead');
    this.initialize();
  }
}
