import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Pokemon,
  PokemonListItem,
  PokemonListResponse,
  PokemonDetails
} from '../core/models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  /**
   * Get a list of Pokemon with pagination
   */
  getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching Pokemon list:', error);
          return of({ count: 0, next: null, previous: null, results: [] });
        })
      );
  }

  /**
   * Get detailed information for a single Pokemon
   */
  getPokemonDetails(nameOrId: string | number): Observable<Pokemon | null> {
    return this.http.get<PokemonDetails>(`${this.baseUrl}/pokemon/${nameOrId}`)
      .pipe(
        map(details => this.transformPokemonDetails(details)),
        catchError(error => {
          console.error(`Error fetching Pokemon details for ${nameOrId}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Get detailed information for multiple Pokemon
   */
  getPokemonListWithDetails(limit: number = 20, offset: number = 0): Observable<Pokemon[]> {
    return this.getPokemonList(limit, offset).pipe(
      switchMap(response => {
        if (!response.results.length) return of([]);

        // Extract Pokemon IDs from URLs for more efficient fetching
        const pokemonRequests = response.results.map(pokemon => {
          const id = this.extractIdFromUrl(pokemon.url);
          return this.getPokemonDetails(id);
        });

        return forkJoin(pokemonRequests);
      }),
      map((pokemonArray: (Pokemon | null)[]) => pokemonArray.filter((pokemon): pokemon is Pokemon => pokemon !== null)),
      catchError(error => {
        console.error('Error fetching Pokemon list with details:', error);
        return of([]);
      })
    );
  }

  /**
   * Search Pokemon by name
   */
  searchPokemon(query: string): Observable<Pokemon[]> {
    if (!query.trim()) {
      return this.getPokemonListWithDetails(20, 0);
    }

    // For simple search, we'll fetch a larger list and filter locally
    // In a real app, you might want to implement server-side search
    return this.getPokemonList(1000, 0).pipe(
      switchMap(response => {
        const filteredResults = response.results.filter(pokemon =>
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 20); // Limit to 20 results

        if (filteredResults.length === 0) return of([]);

        const pokemonRequests = filteredResults.map(pokemon => {
          const id = this.extractIdFromUrl(pokemon.url);
          return this.getPokemonDetails(id);
        });

        return forkJoin(pokemonRequests);
      }),
      map((pokemonArray: (Pokemon | null)[]) => pokemonArray.filter((pokemon): pokemon is Pokemon => pokemon !== null)),
      catchError(error => {
        console.error('Error searching Pokemon:', error);
        return of([]);
      })
    );
  }

  /**
   * Transform API response to our Pokemon interface
   */
  private transformPokemonDetails(details: PokemonDetails): Pokemon {
    return {
      id: details.id,
      name: details.name,
      imageUrl: details.sprites.front_default || '',
      officialArtwork: details.sprites.other['official-artwork'].front_default || details.sprites.front_default || '',
      types: details.types.map(t => t.type.name),
      height: details.height,
      weight: details.weight,
      stats: details.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      }))
    };
  }

  /**
   * Extract Pokemon ID from PokeAPI URL
   */
  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 1;
  }
}
