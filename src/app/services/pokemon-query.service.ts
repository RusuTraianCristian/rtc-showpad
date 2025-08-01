import { Injectable, inject } from '@angular/core';
import {
  injectQuery,
  injectMutation,
  injectQueryClient
} from '@tanstack/angular-query-experimental';
import { PokemonService } from './pokemon.service';
import { AppStateService } from './app-state.service';
import { Pokemon, UserPokemon, PaginatedPokemonResponse } from '../core/models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonQueryService {
  private pokemonService = inject(PokemonService);
  private appState = inject(AppStateService);
  private queryClient = injectQueryClient();

  pokemonListQuery(limit: number = 50, offset: number = 0) {
    return injectQuery(() => ({
      queryKey: ['pokemon-list', limit, offset],
      queryFn: async (): Promise<Pokemon[]> => {
        return new Promise((resolve, reject) => {
          this.pokemonService.getPokemonListWithDetails(limit, offset).subscribe({
            next: (pokemon: Pokemon[]) => resolve(pokemon),
            error: (error: any) => reject(error)
          });
        });
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }));
  }

  /**
   * Query for paginated Pokemon list with metadata
   */
  pokemonPaginatedQuery(limit: number = 20, offset: number = 0) {
    return injectQuery(() => ({
      queryKey: ['pokemon-paginated', limit, offset],
      queryFn: async (): Promise<PaginatedPokemonResponse> => {
        return new Promise((resolve, reject) => {
          this.pokemonService.getPokemonListWithPagination(limit, offset).subscribe({
            next: (response: PaginatedPokemonResponse) => resolve(response),
            error: (error: any) => reject(error)
          });
        });
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }));
  }

  /**
   * Query for Pokemon search with debouncing and caching
   */
  pokemonSearchQuery(query: string) {
    return injectQuery(() => ({
      queryKey: ['pokemon-search', query],
      queryFn: async (): Promise<Pokemon[]> => {
        if (!query.trim()) return [];

        return new Promise((resolve, reject) => {
          this.pokemonService.searchPokemon(query).subscribe({
            next: (pokemon: Pokemon[]) => resolve(pokemon),
            error: (error: any) => reject(error)
          });
        });
      },
      enabled: query.trim().length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    }));
  }

  /**
   * Mutation for catching a Pokemon with optimistic updates
   */
  catchPokemonMutation() {
    return injectMutation(() => ({
      mutationFn: async (pokemon: Pokemon): Promise<UserPokemon> => {
        const userPokemon: UserPokemon = {
          id: pokemon.id,
          name: pokemon.name,
          imageUrl: pokemon.officialArtwork || pokemon.imageUrl
        };
        await new Promise(resolve => setTimeout(resolve, 100));

        this.appState.addCaughtPokemon(userPokemon);
        return userPokemon;
      },
      onSuccess: (userPokemon) => {
        this.queryClient.invalidateQueries({
          queryKey: ['user-pokemon']
        });
      }
    }));
  }

  addToWishlistMutation() {
    return injectMutation(() => ({
      mutationFn: async (pokemon: Pokemon): Promise<UserPokemon> => {
        const userPokemon: UserPokemon = {
          id: pokemon.id,
          name: pokemon.name,
          imageUrl: pokemon.officialArtwork || pokemon.imageUrl
        };

        await new Promise(resolve => setTimeout(resolve, 100));

        this.appState.addToWishlist(userPokemon);
        return userPokemon;
      },
      onSuccess: (userPokemon) => {
        this.queryClient.invalidateQueries({
          queryKey: ['user-pokemon']
        });
      }
    }));
  }

  releasePokemonMutation() {
    return injectMutation(() => ({
      mutationFn: async (pokemonId: number): Promise<number> => {
        await new Promise(resolve => setTimeout(resolve, 100));

        this.appState.removeCaughtPokemon(pokemonId);
        return pokemonId;
      },
      onSuccess: (pokemonId) => {
        this.queryClient.invalidateQueries({
          queryKey: ['user-pokemon']
        });
      }
    }));
  }

  removeFromWishlistMutation() {
    return injectMutation(() => ({
      mutationFn: async (pokemonId: number): Promise<number> => {
        await new Promise(resolve => setTimeout(resolve, 100));

        this.appState.removeFromWishlist(pokemonId);
        return pokemonId;
      },
      onSuccess: (pokemonId) => {
        this.queryClient.invalidateQueries({
          queryKey: ['user-pokemon']
        });
      }
    }));
  }

  userPokemonQuery() {
    return injectQuery(() => ({
      queryKey: ['user-pokemon'],
      queryFn: async () => {
        return this.appState.userPokemons();
      },
      staleTime: 0,
      gcTime: 30 * 60 * 1000,
    }));
  }

  prefetchPokemonList(limit: number = 50, offset: number = 0): void {
    this.queryClient.prefetchQuery({
      queryKey: ['pokemon-list', limit, offset],
      queryFn: async (): Promise<Pokemon[]> => {
        return new Promise((resolve, reject) => {
          this.pokemonService.getPokemonListWithDetails(limit, offset).subscribe({
            next: (pokemon: Pokemon[]) => resolve(pokemon),
            error: (error: any) => reject(error)
          });
        });
      },
      staleTime: 5 * 60 * 1000,
    });
  }

  prefetchPokemonPaginated(limit: number = 20, offset: number = 0): void {
    this.queryClient.prefetchQuery({
      queryKey: ['pokemon-paginated', limit, offset],
      queryFn: async (): Promise<PaginatedPokemonResponse> => {
        return new Promise((resolve, reject) => {
          this.pokemonService.getPokemonListWithPagination(limit, offset).subscribe({
            next: (response: PaginatedPokemonResponse) => resolve(response),
            error: (error: any) => reject(error)
          });
        });
      },
      staleTime: 5 * 60 * 1000,
    });
  }

  invalidateAllPokemonQueries(): void {
    this.queryClient.invalidateQueries({
      queryKey: ['pokemon-list']
    });
    this.queryClient.invalidateQueries({
      queryKey: ['pokemon-paginated']
    });
    this.queryClient.invalidateQueries({
      queryKey: ['pokemon-search']
    });
  }
}
