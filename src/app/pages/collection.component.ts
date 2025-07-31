import { Component, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PokemonFacade } from '../core/facades/pokemon.facade';
import { PokemonService } from '../services/pokemon.service';
import { CustomButtonComponent, PokemonDetailsModalComponent } from '../shared';
import { Pokemon, UserPokemon } from '../core/models/pokemon.model';

@Component({
  selector: 'app-collection',
  imports: [RouterLink, CustomButtonComponent, PokemonDetailsModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-6">My Collection</h2>

      @if (!pokemonFacade.hasUser()) {
        <!-- User not logged in -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Please Log In</h3>
            <p class="text-gray-600 mb-6">
              You need to be logged in to view your collection.
            </p>
          </div>
        </div>
      } @else if (allCollectionPokemon().length === 0) {
        <!-- Empty collection -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Your Collection is Empty</h3>
            <p class="text-gray-600 mb-6">
              Start collecting your favorite Pokemon! Browse the Pokemon list and add them to your collection.
            </p>
            <div class="flex justify-center">
              <a
                routerLink="/dashboard/pokemons"
                class="inline-flex items-center justify-center min-h-[50px] px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white font-medium text-lg rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-500 transition-all duration-200"
              >
                Explore Pokemon
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      } @else {
        <!-- Collection tabs -->
        <div class="mb-6">
          <nav class="flex space-x-1">
            <button
              (click)="activeTab.set('all')"
              [class]="getTabClass('all')"
              type="button"
            >
              All ({{ allCollectionPokemon().length }})
            </button>
            <button
              (click)="activeTab.set('caught')"
              [class]="getTabClass('caught')"
              type="button"
            >
              Caught ({{ pokemonFacade.caughtPokemonCount() }})
            </button>
            <button
              (click)="activeTab.set('wishlist')"
              [class]="getTabClass('wishlist')"
              type="button"
            >
              Wishlist ({{ pokemonFacade.wishlistPokemonCount() }})
            </button>
          </nav>
        </div>

        <!-- Pokemon Grid -->
        @if (isLoading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            <span class="ml-3 text-gray-600">Loading your collection...</span>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">            @for (pokemon of displayedPokemon(); track pokemon.id) {
              <div class="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                   [class]="pokemonFacade.isPokemonCaught(pokemon.id) ? 'bg-green-50' : 'bg-pink-50'"
                   (click)="openPokemonDetails(pokemon)">

                <!-- Top Row: Name/ID left, Heart button right -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 capitalize truncate">{{ pokemon.name }}</h3>
                    <p class="text-sm text-gray-500">#{{ pokemon.id.toString().padStart(3, '0') }}</p>
                  </div>
                  <div class="flex-shrink-0 ml-2">
                    @if (pokemonFacade.isPokemonCaught(pokemon.id)) {
                      <!-- Show muted heart button when Pokemon is caught -->
                      <app-custom-button
                        variant="heart"
                        [disabled]="true"
                        [wishlisted]="pokemonFacade.isPokemonInWishlist(pokemon.id)"
                      >
                      </app-custom-button>
                    } @else {
                      <!-- Show clickable heart button for wishlist-only Pokemon -->
                      <app-custom-button
                        variant="heart"
                        (buttonClick)="removeFromWishlist(pokemon)"
                        [wishlisted]="true"
                      >
                      </app-custom-button>
                    }
                  </div>
                </div>

                <!-- Center: Pokemon Image -->
                <div class="flex-1 flex items-center justify-center mb-3">
                  @if (pokemon.officialArtwork) {
                    <img
                      [src]="pokemon.officialArtwork"
                      [alt]="pokemon.name"
                      class="w-24 h-24 object-contain"
                      loading="lazy"
                    />
                  } @else if (pokemon.imageUrl) {
                    <img
                      [src]="pokemon.imageUrl"
                      [alt]="pokemon.name"
                      class="w-24 h-24 object-contain"
                      loading="lazy"
                    />
                  } @else {
                    <div class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <!-- Bottom Row: Height/Weight left, Action button right -->
                <div class="flex items-center justify-between">
                  <div class="text-xs text-gray-600 space-y-1">
                    <div>{{ (pokemon.height / 10).toFixed(1) }}m</div>
                    <div>{{ (pokemon.weight / 10).toFixed(1) }}kg</div>
                  </div>
                  <div class="flex-shrink-0" (click)="$event.stopPropagation()">
                    @if (pokemonFacade.isPokemonCaught(pokemon.id)) {
                      <!-- Release button for caught Pokemon -->
                      <app-custom-button
                        (buttonClick)="releasePokemon(pokemon)"
                        variant="muted"
                        additionalClasses="!h-8 !line-height-8 !text-xs !px-3"
                      >
                        Release
                      </app-custom-button>
                    } @else {
                      <!-- Remove from wishlist button -->
                      <app-custom-button
                        (buttonClick)="removeFromWishlist(pokemon)"
                        variant="muted"
                        additionalClasses="!h-8 !line-height-8 !text-xs !px-3"
                      >
                        Remove
                      </app-custom-button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Pokemon Details Modal -->
    <app-pokemon-details-modal
      [pokemon]="selectedPokemon()"
      (closeModal)="closePokemonDetails()"
    />
  `
})
export class CollectionComponent {
  protected pokemonFacade = inject(PokemonFacade);
  private pokemonService = inject(PokemonService);

  // Active tab signal
  protected activeTab = signal<'all' | 'caught' | 'wishlist'>('all');
  protected isLoading = signal(false);
  protected collectionPokemon = signal<Pokemon[]>([]);
  protected selectedPokemon = signal<Pokemon | null>(null);

  // Get all collection Pokemon (caught + wishlist with full details)
  protected allCollectionPokemon = computed(() => {
    const userPokemons = this.pokemonFacade.userPokemons();
    const allUserPokemon = [...userPokemons.caught, ...userPokemons.wishlist];

    // Remove duplicates (Pokemon that are both caught and wishlisted)
    const uniquePokemon = allUserPokemon.filter((pokemon, index, self) =>
      index === self.findIndex(p => p.id === pokemon.id)
    );

    return this.collectionPokemon().filter(p =>
      uniquePokemon.some(up => up.id === p.id)
    );
  });

  // Filtered Pokemon based on active tab
  protected displayedPokemon = computed(() => {
    const userPokemons = this.pokemonFacade.userPokemons();
    const allPokemon = this.allCollectionPokemon();

    switch (this.activeTab()) {
      case 'caught':
        return allPokemon.filter(p =>
          userPokemons.caught.some(cp => cp.id === p.id)
        );
      case 'wishlist':
        return allPokemon.filter(p =>
          userPokemons.wishlist.some(wp => wp.id === p.id) &&
          !userPokemons.caught.some(cp => cp.id === p.id) // Exclude caught Pokemon from wishlist tab
        );
      default:
        return allPokemon;
    }
  });

  constructor() {
    // Load full Pokemon details when user Pokemon changes
    effect(() => {
      // This effect will run whenever userPokemons signal changes
      const userPokemons = this.pokemonFacade.userPokemons();
      this.loadCollectionDetails();
    });
  }

  private async loadCollectionDetails(): Promise<void> {
    const userPokemons = this.pokemonFacade.userPokemons();
    const allUserPokemon = [...userPokemons.caught, ...userPokemons.wishlist];

    if (allUserPokemon.length === 0) {
      this.collectionPokemon.set([]);
      return;
    }

    this.isLoading.set(true);

    try {
      // Get unique Pokemon IDs
      const uniqueIds = [...new Set(allUserPokemon.map(p => p.id))];

      // Fetch full details for each Pokemon
      const pokemonDetails$ = uniqueIds.map(id =>
        this.pokemonService.getPokemonDetails(id)
      );

      const pokemonDetails = await forkJoin(pokemonDetails$).toPromise();
      const validPokemon = (pokemonDetails || []).filter((p): p is Pokemon => p !== null);
      this.collectionPokemon.set(validPokemon);
    } catch (error) {
      console.error('Error loading collection details:', error);
      this.collectionPokemon.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected getTabClass(tab: string): string {
    const baseClass = 'px-3 py-2 text-sm font-medium rounded-md transition-colors';
    if (this.activeTab() === tab) {
      return `${baseClass} bg-purple-100 text-purple-700`;
    }
    return `${baseClass} text-gray-500 hover:text-gray-700 hover:bg-gray-100`;
  }

  protected releasePokemon(pokemon: Pokemon): void {
    this.pokemonFacade.releasePokemon(pokemon.id);
  }

  protected removeFromWishlist(pokemon: Pokemon): void {
    this.pokemonFacade.removeFromWishlist(pokemon.id);
  }

  protected openPokemonDetails(pokemon: Pokemon): void {
    this.selectedPokemon.set(pokemon);
  }

  protected closePokemonDetails(): void {
    this.selectedPokemon.set(null);
  }
}
