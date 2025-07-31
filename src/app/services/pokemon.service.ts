import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  Pokemon,
  PokemonListItem,
  PokemonListResponse,
  PokemonDetails,
  PaginatedPokemonResponse
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
   * Get detailed information for multiple Pokemon with pagination metadata
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
   * Get detailed information for multiple Pokemon with pagination metadata
   */
  getPokemonListWithPagination(limit: number = 20, offset: number = 0): Observable<PaginatedPokemonResponse> {
    return this.getPokemonList(limit, offset).pipe(
      switchMap(response => {
        if (!response.results.length) {
          return of({
            pokemon: [],
            count: response.count,
            next: response.next,
            previous: response.previous,
            hasMore: false
          });
        }

        // Extract Pokemon IDs from URLs for more efficient fetching
        const pokemonRequests = response.results.map(pokemon => {
          const id = this.extractIdFromUrl(pokemon.url);
          return this.getPokemonDetails(id);
        });

        return forkJoin(pokemonRequests).pipe(
          map((pokemonArray: (Pokemon | null)[]) => {
            const filteredPokemon = pokemonArray.filter((pokemon): pokemon is Pokemon => pokemon !== null);
            return {
              pokemon: filteredPokemon,
              count: response.count,
              next: response.next,
              previous: response.previous,
              hasMore: response.next !== null
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching Pokemon list with pagination:', error);
        return of({
          pokemon: [],
          count: 0,
          next: null,
          previous: null,
          hasMore: false
        });
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
      baseExperience: details.base_experience,
      abilities: details.abilities?.map(a => ({
        name: a.ability.name,
        isHidden: a.is_hidden
      })),
      sprites: {
        frontShiny: details.sprites.front_shiny || undefined,
        backDefault: details.sprites.back_default || undefined
      },
      stats: details.stats.map(s => ({
        name: s.stat.name,
        baseStat: s.base_stat
      })),
      moves: details.moves?.slice(0, 20).map(m => {
        // Get the most recent version group details for level learned
        const latestVersion = m.version_group_details[m.version_group_details.length - 1];
        return {
          name: m.move.name,
          levelLearnedAt: latestVersion?.level_learned_at || undefined,
          learnMethod: latestVersion?.move_learn_method.name || 'unknown'
        };
      })
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
