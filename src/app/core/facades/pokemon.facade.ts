import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonQueryService } from '../../services/pokemon-query.service';
import { AppStateService } from '../../services/app-state.service';
import { Pokemon, UserPokemon, PaginatedPokemonResponse } from '../models/pokemon.model';

/**
 * Pokemon facade service that combines Pokemon API operations with user state management
 * This service provides a clean interface for components to interact with Pokemon data
 * Following the layered architecture: Data Services → TanStack Query → State Management → UI Components
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonFacade {
  private pokemonService = inject(PokemonService);
  private pokemonQuery = inject(PokemonQueryService);
  private appState = inject(AppStateService);
  readonly userPokemons = this.appState.userPokemons;
  readonly caughtPokemonCount = this.appState.caughtPokemonCount;
  readonly wishlistPokemonCount = this.appState.wishlistPokemonCount;
  readonly hasUser = this.appState.hasUser;

  /**
   * Get Pokemon list query with caching and background updates
   */
  getPokemonListQuery(limit: number = 50, offset: number = 0) {
    return this.pokemonQuery.pokemonListQuery(limit, offset);
  }

  /**
   * Get paginated Pokemon list query with metadata
   */
  getPokemonPaginatedQuery(limit: number = 20, offset: number = 0) {
    return this.pokemonQuery.pokemonPaginatedQuery(limit, offset);
  }

  /**
   * Get Pokemon search query with debouncing and caching
   */
  getPokemonSearchQuery(query: string) {
    return this.pokemonQuery.pokemonSearchQuery(query);
  }

  /**
   * Get user Pokemon query
   */
  getUserPokemonQuery() {
    return this.pokemonQuery.userPokemonQuery();
  }

  /**
   * Load a list of Pokemon with pagination (fallback method)
   */
  loadPokemonList(limit: number = 50, offset: number = 0): Observable<Pokemon[]> {
    return this.pokemonService.getPokemonListWithDetails(limit, offset);
  }

  /**
   * Load a paginated list of Pokemon with metadata (fallback method)
   */
  loadPokemonListWithPagination(limit: number = 20, offset: number = 0): Observable<PaginatedPokemonResponse> {
    return this.pokemonService.getPokemonListWithPagination(limit, offset);
  }

  /**
   * Search Pokemon by name (fallback method)
   */
  searchPokemon(query: string): Observable<Pokemon[]> {
    return this.pokemonService.searchPokemon(query);
  }

  /**
   * Get detailed information for a single Pokemon
   */
  getPokemonDetails(nameOrId: string | number): Observable<Pokemon | null> {
    return this.pokemonService.getPokemonDetails(nameOrId);
  }

  /**
   * Get catch Pokemon mutation
   */
  getCatchPokemonMutation() {
    return this.pokemonQuery.catchPokemonMutation();
  }

  /**
   * Get add to wishlist mutation
   */
  getAddToWishlistMutation() {
    return this.pokemonQuery.addToWishlistMutation();
  }

  /**
   * Get release Pokemon mutation
   */
  getReleasePokemonMutation() {
    return this.pokemonQuery.releasePokemonMutation();
  }

  /**
   * Get remove from wishlist mutation
   */
  getRemoveFromWishlistMutation() {
    return this.pokemonQuery.removeFromWishlistMutation();
  }

  /**
   * Add Pokemon to caught collection (legacy method, prefer using mutation)
   */
  catchPokemon(pokemon: Pokemon): void {
    if (!this.hasUser()) {
      console.warn('Cannot catch Pokemon: User not logged in');
      return;
    }

    const userPokemon: UserPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.officialArtwork || pokemon.imageUrl
    };

    this.appState.addCaughtPokemon(userPokemon);
  }

  /**
   * Add Pokemon to wishlist (legacy method, prefer using mutation)
   */
  addToWishlist(pokemon: Pokemon): void {
    if (!this.hasUser()) {
      console.warn('Cannot add to wishlist: User not logged in');
      return;
    }

    const userPokemon: UserPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.officialArtwork || pokemon.imageUrl
    };

    this.appState.addToWishlist(userPokemon);
  }

  /**
   * Remove Pokemon from caught collection (legacy method, prefer using mutation)
   */
  releasePokemon(pokemonId: number): void {
    this.appState.removeCaughtPokemon(pokemonId);
  }

  /**
   * Remove Pokemon from wishlist (legacy method, prefer using mutation)
   */
  removeFromWishlist(pokemonId: number): void {
    this.appState.removeFromWishlist(pokemonId);
  }

  /**
   * Check if Pokemon is caught
   */
  isPokemonCaught(pokemonId: number): boolean {
    return this.userPokemons().caught.some(p => p.id === pokemonId);
  }

  /**
   * Check if Pokemon is in wishlist
   */
  isPokemonInWishlist(pokemonId: number): boolean {
    return this.userPokemons().wishlist.some(p => p.id === pokemonId);
  }

  /**
   * Get Pokemon type CSS class for styling
   */
  getTypeClass(type: string): string {
    const typeClasses: { [key: string]: string } = {
      'normal': 'bg-gray-200 text-gray-800',
      'fire': 'bg-red-200 text-red-800',
      'water': 'bg-blue-200 text-blue-800',
      'electric': 'bg-yellow-200 text-yellow-800',
      'grass': 'bg-green-200 text-green-800',
      'ice': 'bg-blue-100 text-blue-700',
      'fighting': 'bg-red-300 text-red-900',
      'poison': 'bg-purple-200 text-purple-800',
      'ground': 'bg-yellow-300 text-yellow-900',
      'flying': 'bg-indigo-200 text-indigo-800',
      'psychic': 'bg-pink-200 text-pink-800',
      'bug': 'bg-green-300 text-green-900',
      'rock': 'bg-yellow-400 text-yellow-900',
      'ghost': 'bg-purple-300 text-purple-900',
      'dragon': 'bg-indigo-300 text-indigo-900',
      'dark': 'bg-gray-400 text-gray-900',
      'steel': 'bg-gray-300 text-gray-800',
      'fairy': 'bg-pink-300 text-pink-900'
    };

    return typeClasses[type] || 'bg-gray-200 text-gray-800';
  }

  /**
   * Prefetch Pokemon list for better UX
   */
  prefetchPokemonList(limit: number = 50, offset: number = 0): void {
    this.pokemonQuery.prefetchPokemonList(limit, offset);
  }

  /**
   * Prefetch paginated Pokemon list for better UX
   */
  prefetchPokemonPaginated(limit: number = 20, offset: number = 0): void {
    this.pokemonQuery.prefetchPokemonPaginated(limit, offset);
  }

  /**
   * Invalidate all Pokemon queries to force refresh
   */
  invalidateAllPokemonQueries(): void {
    this.pokemonQuery.invalidateAllPokemonQueries();
  }
}
