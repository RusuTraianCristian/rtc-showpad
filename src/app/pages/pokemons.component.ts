import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PokemonFacade, Pokemon } from '../core';

@Component({
  selector: 'app-pokemons',
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-gray-900">Pokemon Collection</h2>
        <div class="text-sm text-gray-600">
          Showing {{ pokemonList().length }} Pokemon
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search Pokemon by name..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
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
          <button
            (click)="loadPokemon()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      }

      <!-- Pokemon Grid -->
      @else if (pokemonList().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (pokemon of pokemonList(); track pokemon.id) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <!-- Pokemon Image -->
              <div class="text-center mb-3">
                @if (pokemon.officialArtwork) {
                  <img
                    [src]="pokemon.officialArtwork"
                    [alt]="pokemon.name"
                    class="w-24 h-24 mx-auto object-contain"
                    loading="lazy"
                  />
                } @else if (pokemon.imageUrl) {
                  <img
                    [src]="pokemon.imageUrl"
                    [alt]="pokemon.name"
                    class="w-24 h-24 mx-auto object-contain"
                    loading="lazy"
                  />
                } @else {
                  <div class="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                }
              </div>

              <!-- Pokemon Info -->
              <div class="text-center">
                <h3 class="text-lg font-semibold text-gray-900 mb-1 capitalize">{{ pokemon.name }}</h3>
                <p class="text-sm text-gray-500 mb-2">#{{ pokemon.id.toString().padStart(3, '0') }}</p>

                <!-- Pokemon Types -->
                <div class="flex justify-center gap-1 mb-3">
                  @for (type of pokemon.types; track type) {
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                          [class]="pokemonFacade.getTypeClass(type)">
                      {{ type }}
                    </span>
                  }
                </div>

                <!-- Pokemon Stats (height/weight) -->
                <div class="text-xs text-gray-600 space-y-1 mb-3">
                  <div>Height: {{ (pokemon.height / 10).toFixed(1) }}m</div>
                  <div>Weight: {{ (pokemon.weight / 10).toFixed(1) }}kg</div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2 justify-center">
                  <button
                    (click)="pokemonFacade.catchPokemon(pokemon)"
                    [disabled]="pokemonFacade.isPokemonCaught(pokemon.id)"
                    [class]="pokemonFacade.isPokemonCaught(pokemon.id)
                      ? 'bg-green-100 text-green-600 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'"
                    class="px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-75"
                  >
                    {{ pokemonFacade.isPokemonCaught(pokemon.id) ? 'Caught' : 'Catch' }}
                  </button>

                  <button
                    (click)="pokemonFacade.addToWishlist(pokemon)"
                    [disabled]="pokemonFacade.isPokemonInWishlist(pokemon.id) || pokemonFacade.isPokemonCaught(pokemon.id)"
                    [class]="pokemonFacade.isPokemonInWishlist(pokemon.id) || pokemonFacade.isPokemonCaught(pokemon.id)
                      ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'"
                    class="px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-75"
                  >
                    {{ pokemonFacade.isPokemonInWishlist(pokemon.id) ? 'In Wishlist' : 'Wishlist' }}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
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
            {{ searchQuery ? 'Try a different search term' : 'Unable to load Pokemon data' }}
          </p>
        </div>
      }
    </div>
  `
})
export class PokemonsComponent {
  protected pokemonFacade = inject(PokemonFacade);

  // Component state signals
  pokemonList = signal<Pokemon[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchQuery = '';

  private searchTimeout: any;

  constructor() {
    // Load Pokemon on component initialization
    this.loadPokemon();
  }

  loadPokemon(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pokemonFacade.loadPokemonList(50, 0).subscribe({
      next: (pokemon: Pokemon[]) => {
        this.pokemonList.set(pokemon);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading Pokemon:', err);
        this.error.set('Failed to load Pokemon. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 500);
  }

  private performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadPokemon();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.pokemonFacade.searchPokemon(this.searchQuery.trim()).subscribe({
      next: (pokemon: Pokemon[]) => {
        this.pokemonList.set(pokemon);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error searching Pokemon:', err);
        this.error.set('Failed to search Pokemon. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
