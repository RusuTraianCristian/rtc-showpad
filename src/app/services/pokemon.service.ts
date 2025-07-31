import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
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
  private readonly REQUEST_TIMEOUT = 10000;
  private readonly MAX_RETRIES = 3;

  getPokemonList(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        retry({
          count: this.MAX_RETRIES,
          delay: (error, retryCount) => {
            if (error.status === 429) {
              return timer(Math.pow(2, retryCount) * 1000);
            }
            return timer(1000 * retryCount);
          }
        }),
        catchError(error => {
          const errorMessage = this.getErrorMessage(error, 'fetch Pokemon list');
          return of({ count: 0, next: null, previous: null, results: [], error: errorMessage });
        })
      );
  }

  getPokemonDetails(nameOrId: string | number): Observable<Pokemon | null> {
    return this.http.get<PokemonDetails>(`${this.baseUrl}/pokemon/${nameOrId}`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        retry({
          count: this.MAX_RETRIES,
          delay: (error, retryCount) => {
            if (error.status === 429) {
              return timer(Math.pow(2, retryCount) * 1000);
            }
            return timer(1000 * retryCount);
          }
        }),
        map(details => this.transformPokemonDetails(details)),
        catchError(error => {
          if (error.status === 404) {
            return of(null);
          }
          return of(null);
        })
      );
  }

  getPokemonListWithDetails(limit: number = 20, offset: number = 0): Observable<Pokemon[]> {
    return this.getPokemonList(limit, offset).pipe(
      switchMap(response => {
        if (!response.results.length) return of([]);

        const pokemonRequests = response.results.map(pokemon => {
          const id = this.extractIdFromUrl(pokemon.url);
          return this.getPokemonDetails(id);
        });

        return forkJoin(pokemonRequests);
      }),
      map((pokemonArray: (Pokemon | null)[]) => pokemonArray.filter((pokemon): pokemon is Pokemon => pokemon !== null)),
      catchError(error => {
        return of([]);
      })
    );
  }

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

  searchPokemon(query: string): Observable<Pokemon[]> {
    if (!query.trim()) {
      return this.getPokemonListWithDetails(20, 0);
    }

    return this.getPokemonList(1000, 0).pipe(
      switchMap(response => {
        const filteredResults = response.results.filter(pokemon =>
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 20);

        if (filteredResults.length === 0) return of([]);

        const pokemonRequests = filteredResults.map(pokemon => {
          const id = this.extractIdFromUrl(pokemon.url);
          return this.getPokemonDetails(id);
        });

        return forkJoin(pokemonRequests);
      }),
      map((pokemonArray: (Pokemon | null)[]) => pokemonArray.filter((pokemon): pokemon is Pokemon => pokemon !== null)),
      catchError(error => {
        return of([]);
      })
    );
  }

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
      moves: details.moves?.map(m => {
        const latestVersion = m.version_group_details[m.version_group_details.length - 1];
        return {
          name: m.move.name,
          levelLearnedAt: latestVersion?.level_learned_at || undefined,
          learnMethod: latestVersion?.move_learn_method.name || 'unknown'
        };
      })
    };
  }

  private extractIdFromUrl(url: string): number {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches ? parseInt(matches[1], 10) : 1;
  }

  private getErrorMessage(error: any, operation: string): string {
    if (error.userMessage) {
      return error.userMessage;
    }

    if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    }

    if (error.status === 429) {
      return 'API rate limit exceeded. Please wait before making more requests.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return `Failed to ${operation}. Please try again.`;
  }
}
