import { Injectable, signal, computed, effect } from '@angular/core';
import { UserPokemon, UserPokemonData, UserData } from '../core/models/pokemon.model';

export interface AppState {
  user: {
    name: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    pokemons: UserPokemonData;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private readonly STORAGE_KEY = 'pokedex_user_data';

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
    // Effect to sync state changes to localStorage
    effect(() => {
      const userName = this.userNameSignal();
      const pokemonData = this.userPokemonSignal();

      if (userName !== null) {
        this.saveUserDataToStorage({ name: userName, pokemons: pokemonData });
      }
    });
  }

  /**
   * Initialize user state - called once on app startup
   */
  async initialize(): Promise<void> {
    if (this.userInitializedSignal()) {
      return; // Already initialized
    }

    console.log('Initializing user state...');
    this.userLoadingSignal.set(true);

    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Reading user data from localStorage...');
      const storedUserData = this.getUserDataFromStorage();

      if (storedUserData) {
        console.log('Found stored user data:', storedUserData);
        this.userNameSignal.set(storedUserData.name);
        this.userPokemonSignal.set(storedUserData.pokemons);
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
   * Initialize user state from localStorage (legacy method)
   * @deprecated Use initialize() instead
   */
  initializeUserState(): void {
    console.warn('initializeUserState() is deprecated, use initialize() instead');
    this.initialize();
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
   * Clear user from state and localStorage
   */
  clearUser(): void {
    console.log('Clearing user from global state');
    this.userNameSignal.set(null);
    this.userPokemonSignal.set(this.defaultPokemonData);
    this.removeUserDataFromStorage();
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
   * Get user data from localStorage
   */
  private getUserDataFromStorage(): UserData | null {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return null;
      }

      const parsed = JSON.parse(storedData) as UserData;

      // Validate the structure
      if (!parsed.name || !parsed.pokemons) {
        console.warn('Invalid user data structure in localStorage');
        return null;
      }

      // Ensure pokemons has correct structure
      if (!Array.isArray(parsed.pokemons.caught) || !Array.isArray(parsed.pokemons.wishlist)) {
        console.warn('Invalid Pokemon data structure in localStorage');
        return {
          name: parsed.name,
          pokemons: this.defaultPokemonData
        };
      }

      console.log('Retrieved user data from localStorage:', parsed);
      return parsed;
    } catch (error) {
      console.warn('Failed to read user data from localStorage:', error);
      return null;
    }
  }

  /**
   * Save user data to localStorage
   */
  private saveUserDataToStorage(userData: UserData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
      console.log('User data saved to localStorage:', userData);
    } catch (error) {
      console.error('Failed to save user data to localStorage:', error);
      throw new Error('Unable to save user data');
    }
  }

  /**
   * Remove user data from localStorage
   */
  private removeUserDataFromStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('User data removed from localStorage');
    } catch (error) {
      console.warn('Failed to remove user data from localStorage:', error);
    }
  }
}
