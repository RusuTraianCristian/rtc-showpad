import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { AppStateService } from '../../services/app-state.service';
import { Pokemon, UserPokemon } from '../models/pokemon.model';

/**
 * Pokemon facade service that combines Pokemon API operations with user state management
 * This service provides a clean interface for components to interact with Pokemon data
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonFacade {
  private pokemonService = inject(PokemonService);
  private appState = inject(AppStateService);

  // Re-export user state for easy access
  readonly userPokemons = this.appState.userPokemons;
  readonly caughtPokemonCount = this.appState.caughtPokemonCount;
  readonly wishlistPokemonCount = this.appState.wishlistPokemonCount;
  readonly hasUser = this.appState.hasUser;

  /**
   * Load a list of Pokemon with pagination
   */
  loadPokemonList(limit: number = 50, offset: number = 0): Observable<Pokemon[]> {
    return this.pokemonService.getPokemonListWithDetails(limit, offset);
  }

  /**
   * Search Pokemon by name
   */
  searchPokemon(query: string): Observable<Pokemon[]> {
    return this.pokemonService.searchPokemon(query);
  }

  /**
   * Add Pokemon to caught collection
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
   * Add Pokemon to wishlist
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
   * Remove Pokemon from caught collection
   */
  releasePokemon(pokemonId: number): void {
    this.appState.removeCaughtPokemon(pokemonId);
  }

  /**
   * Remove Pokemon from wishlist
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
}
