import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LazyImageComponent } from '../shared';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PokemonFacade, Pokemon, PaginatedPokemonResponse } from '../core';
import { CustomButtonComponent } from '../shared';

@Component({
  selector: 'app-pokemons',
  imports: [FormsModule, CommonModule, CustomButtonComponent, LazyImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-gray-900">Pokemons</h2>
        <div class="text-sm text-gray-600">
          @if (isSearching()) {
            @if (selectedTypes().size > 0) {
              Showing {{ displayedPokemonList().length }} filtered search results
            } @else {
              Showing {{ displayedPokemonList().length }} search results
            }
          } @else if (selectedTypes().size > 0) {
            Showing {{ displayedPokemonList().length }} of {{ allPokemonList().length }} Pokemon (filtered)
          } @else {
            Showing {{ allPokemonList().length }}{{ totalPokemonCount() > 0 ? ' of ' + totalPokemonCount() : '' }} Pokemon
          }
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <label for="pokemon-search" class="sr-only">Search Pokemon by name</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            id="pokemon-search"
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search Pokemon by name..."
            class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            [attr.aria-describedby]="searchQuery() ? 'search-results-count' : null"
            aria-label="Search Pokemon by name"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
              title="Clear search"
            >
              <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          }
        </div>
        @if (searchQuery()) {
          <div id="search-results-count" class="sr-only" aria-live="polite">
            {{ displayedPokemonList().length }} search results found
          </div>
        }
      </div>

      <!-- Type Filters -->
      @if (availableTypes().length > 0) {
        <div class="mb-6" role="group" aria-labelledby="type-filter-heading">
          <div class="flex items-center gap-3 mb-3">
            <h3 id="type-filter-heading" class="text-sm font-medium text-gray-700">Filter by Type:</h3>
            @if (selectedTypes().size > 0) {
              <button
                type="button"
                (click)="clearTypeFilters()"
                class="text-xs text-blue-600 hover:text-blue-800 underline"
                aria-label="Clear all type filters"
              >
                Clear filters
              </button>
            }
          </div>
          <div class="flex flex-wrap gap-2">
            @for (type of availableTypes(); track type) {
              <button
                type="button"
                (click)="toggleType(type)"
                class="px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 capitalize"
                [class]="selectedTypes().has(type)
                  ? pokemonFacade.getTypeClass(type) + ' ring-2 ring-offset-1 ring-gray-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                [attr.aria-pressed]="selectedTypes().has(type)"
                [attr.aria-label]="'Filter by ' + type + ' type' + (selectedTypes().has(type) ? ', currently active' : '')"
                role="button"
              >
                {{ type }}
              </button>
            }
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (isInitialLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-xl text-gray-600">Loading Pokemon...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Pokemon</h3>
          <p class="text-red-700 mb-4">{{ error() }}</p>
          <app-custom-button (buttonClick)="loadInitialPokemon()">
            Try Again
          </app-custom-button>
        </div>
      }

      <!-- Pokemon Grid -->
      @else if (displayedPokemonList().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" role="grid" aria-label="Pokemon cards">
          @for (pokemon of displayedPokemonList(); track pokemon.id) {
            <article
              class="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
              [class]="pokemonFacade.isPokemonCaught(pokemon.id) ? 'bg-green-50' : pokemonFacade.isPokemonInWishlist(pokemon.id) ? 'bg-pink-50' : 'bg-white'"
              (click)="openPokemonDetails(pokemon)"
              (keydown.enter)="openPokemonDetails(pokemon)"
              (keydown.space)="openPokemonDetails(pokemon)"
              tabindex="0"
              role="gridcell"
              [attr.aria-label]="'Pokemon card for ' + pokemon.name + '. ID: ' + pokemon.id + '. Types: ' + pokemon.types.join(', ') + '. ' + (pokemonFacade.isPokemonCaught(pokemon.id) ? 'Already caught.' : 'Not caught yet.') + ' Click to view details.'"
            >

              <!-- Top Row: Name/ID left, Heart button right -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 capitalize truncate">{{ pokemon.name }}</h3>
                  <p class="text-sm text-gray-500">#{{ pokemon.id.toString().padStart(3, '0') }}</p>
                </div>
                <div class="flex-shrink-0 ml-2" (click)="$event.stopPropagation()">
                  @if (pokemonFacade.isPokemonCaught(pokemon.id)) {
                    <!-- Show muted heart button when Pokemon is caught -->
                    <app-custom-button
                      variant="heart"
                      [disabled]="true"
                      [wishlisted]="pokemonFacade.isPokemonInWishlist(pokemon.id)"
                    >
                    </app-custom-button>
                  } @else {
                    <!-- Show heart toggle button when Pokemon is not caught -->
                    <app-custom-button
                      variant="heart"
                      (buttonClick)="toggleWishlist(pokemon)"
                      [wishlisted]="pokemonFacade.isPokemonInWishlist(pokemon.id)"
                    >
                    </app-custom-button>
                  }
                </div>
              </div>

              <!-- Center: Pokemon Image -->
              <div class="flex-1 flex items-center justify-center mb-3">
                @if (pokemon.officialArtwork) {
                  <app-lazy-image
                    [src]="pokemon.officialArtwork"
                    [alt]="pokemon.name + ' official artwork'"
                    imageClass="w-24 h-24 object-contain"
                    containerClass="w-24 h-24"
                    placeholderClass="w-24 h-24"
                  />
                } @else if (pokemon.imageUrl) {
                  <app-lazy-image
                    [src]="pokemon.imageUrl"
                    [alt]="pokemon.name + ' sprite'"
                    imageClass="w-24 h-24 object-contain"
                    containerClass="w-24 h-24"
                    placeholderClass="w-24 h-24"
                  />
                } @else {
                  <div class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center" role="img" [attr.aria-label]="'No image available for ' + pokemon.name">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                }
              </div>

              <!-- Pokemon Types (centered) -->
              <div class="flex justify-center gap-1 mb-3">
                @for (type of pokemon.types; track type) {
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        [class]="pokemonFacade.getTypeClass(type)">
                    {{ type }}
                  </span>
                }
              </div>

              <!-- Bottom Row: Height/Weight left, Catch button right -->
              <div class="flex items-center justify-between">
                <div class="text-xs text-gray-600 space-y-1">
                  <div>{{ (pokemon.height / 10).toFixed(1) }}m</div>
                  <div>{{ (pokemon.weight / 10).toFixed(1) }}kg</div>
                </div>
                <div class="flex-shrink-0" (click)="$event.stopPropagation()">
                  <app-custom-button
                    (buttonClick)="pokemonFacade.catchPokemon(pokemon)"
                    [variant]="pokemonFacade.isPokemonCaught(pokemon.id) ? 'muted' : 'normal'"
                    [disabled]="pokemonFacade.isPokemonCaught(pokemon.id)"
                    additionalClasses="!h-8 !line-height-8 !text-xs !px-3"
                  >
                    {{ pokemonFacade.isPokemonCaught(pokemon.id) ? 'Caught' : 'Catch' }}
                  </app-custom-button>
                </div>
              </div>
            </article>
          }
        </div>

        <!-- Load More Button -->
        @if (hasMore() && !isSearching()) {
          <div class="text-center mt-8">
            <app-custom-button
              (buttonClick)="loadMorePokemon()"
              [disabled]="isLoadingMore()"
              additionalClasses="!px-8 !py-3"
            >
              @if (isLoadingMore()) {
                <div class="flex items-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Loading...
                </div>
              } @else {
                Load More Pokemon
              }
            </app-custom-button>
            @if (totalPokemonCount() > 0) {
              <p class="text-sm text-gray-500 mt-2">
                {{ allPokemonList().length }} of {{ totalPokemonCount() }} Pokemon loaded
              </p>
            }
          </div>
        }
      }

      <!-- Empty State -->
      @else {
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Pokemon Found</h3>
          <p class="text-gray-600">
            {{ searchQuery() ? 'Try a different search term' : 'Unable to load Pokemon data' }}
          </p>
        </div>
      }
    </div>
  `
})
export class PokemonsComponent implements OnDestroy {
  protected pokemonFacade = inject(PokemonFacade);
  private router = inject(Router);
  private readonly POKEMON_PER_PAGE = 20;
  private _allPokemonList = signal<Pokemon[]>([]);
  private _searchResults = signal<Pokemon[]>([]);
  private _isInitialLoading = signal<boolean>(true);
  private _isLoadingMore = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _hasMore = signal<boolean>(true);
  private _totalPokemonCount = signal<number>(0);
  private _currentOffset = signal<number>(0);

  searchQuery = signal('');
  private searchTimeout: any;
  protected selectedTypes = signal<Set<string>>(new Set());
  protected isSearching = computed(() => this.searchQuery().trim().length > 0);
  protected availableTypes = computed(() => {
    const pokemonList = this.isSearching() ? this._searchResults() : this._allPokemonList();
    const types = new Set<string>();
    pokemonList.forEach(pokemon => {
      pokemon.types.forEach(type => types.add(type));
    });
    return Array.from(types).sort();
  });

  protected displayedPokemonList = computed(() => {
    const pokemonList = this.isSearching() ? this._searchResults() : this._allPokemonList();
    const selectedTypesSet = this.selectedTypes();

    if (selectedTypesSet.size === 0) {
      return pokemonList;
    }

    return pokemonList.filter(pokemon =>
      pokemon.types.some(type => selectedTypesSet.has(type))
    );
  });

  protected allPokemonList = this._allPokemonList.asReadonly();
  protected isInitialLoading = this._isInitialLoading.asReadonly();
  protected isLoadingMore = this._isLoadingMore.asReadonly();
  protected error = this._error.asReadonly();
  protected hasMore = this._hasMore.asReadonly();
  protected totalPokemonCount = this._totalPokemonCount.asReadonly();

  constructor() {
    this.loadInitialPokemon();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadInitialPokemon(): void {
    this._isInitialLoading.set(true);
    this._error.set(null);
    this._currentOffset.set(0);
    this._allPokemonList.set([]);

    this.pokemonFacade.loadPokemonListWithPagination(this.POKEMON_PER_PAGE, 0).subscribe({
      next: (response: PaginatedPokemonResponse) => {
        this._allPokemonList.set(response.pokemon);
        this._hasMore.set(response.hasMore);
        this._totalPokemonCount.set(response.count);
        this._currentOffset.set(this.POKEMON_PER_PAGE);
        this._isInitialLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading initial Pokemon:', err);
        this._error.set('Failed to load Pokemon. Please try again.');
        this._isInitialLoading.set(false);
      }
    });
  }

  loadMorePokemon(): void {
    if (!this._hasMore() || this._isLoadingMore() || this.isSearching()) {
      return;
    }

    this._isLoadingMore.set(true);
    this._error.set(null);

    const offset = this._currentOffset();

    this.pokemonFacade.loadPokemonListWithPagination(this.POKEMON_PER_PAGE, offset).subscribe({
      next: (response: PaginatedPokemonResponse) => {
        const currentList = this._allPokemonList();
        this._allPokemonList.set([...currentList, ...response.pokemon]);
        this._hasMore.set(response.hasMore);
        this._currentOffset.set(offset + this.POKEMON_PER_PAGE);
        this._isLoadingMore.set(false);
        if (response.hasMore) {
          this.pokemonFacade.prefetchPokemonPaginated(this.POKEMON_PER_PAGE, offset + this.POKEMON_PER_PAGE);
        }
      },
      error: (err: any) => {
        console.error('Error loading more Pokemon:', err);
        this._error.set('Failed to load more Pokemon. Please try again.');
        this._isLoadingMore.set(false);
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 500);
  }

  private performSearch(): void {
    if (!this.searchQuery().trim()) {
      this._searchResults.set([]);
      return;
    }

    this._isInitialLoading.set(true);
    this._error.set(null);

    this.pokemonFacade.searchPokemon(this.searchQuery().trim()).subscribe({
      next: (pokemon: Pokemon[]) => {
        this._searchResults.set(pokemon);
        this._isInitialLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error searching Pokemon:', err);
        this._error.set('Failed to search Pokemon. Please try again.');
        this._isInitialLoading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this._searchResults.set([]);
    this.selectedTypes.set(new Set()); // Clear type filters when clearing search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  toggleWishlist(pokemon: Pokemon): void {
    if (this.pokemonFacade.isPokemonInWishlist(pokemon.id)) {
      this.pokemonFacade.removeFromWishlist(pokemon.id);
    } else {
      this.pokemonFacade.addToWishlist(pokemon);
    }
  }

  toggleType(type: string): void {
    const currentTypes = new Set(this.selectedTypes());
    if (currentTypes.has(type)) {
      currentTypes.delete(type);
    } else {
      currentTypes.add(type);
    }
    this.selectedTypes.set(currentTypes);
  }

  clearTypeFilters(): void {
    this.selectedTypes.set(new Set());
  }

  openPokemonDetails(pokemon: Pokemon): void {
    this.router.navigate(['/dashboard/pokemon', pokemon.id]);
  }
}
