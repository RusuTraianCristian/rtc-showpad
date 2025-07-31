import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PokemonFacade, Pokemon } from '../core';
import { CustomButtonComponent, LazyImageComponent } from '../shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pokemon-detail',
  imports: [CommonModule, CustomButtonComponent, LazyImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading()) {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-xl text-gray-600">Loading Pokemon details...</p>
        </div>
      </div>
    }

    @else if (error()) {
      <div class="min-h-screen flex items-center justify-center" role="alert">
        <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-900 mb-2">Pokemon Not Found</h3>
          <p class="text-red-700 mb-4">{{ error() }}</p>
          <app-custom-button (buttonClick)="goBack()">
            Go Back
          </app-custom-button>
        </div>
      </div>
    }

    @else if (pokemon()) {
      <div class="min-h-screen bg-gray-50">
        <!-- Header with navigation -->
        <header class="bg-white shadow-sm border-b" role="banner">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between py-4">
              <div class="flex items-center gap-4">
                <app-custom-button (buttonClick)="goBack()" variant="muted">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back
                </app-custom-button>
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 capitalize">{{ pokemon()!.name }}</h1>
                  <p class="text-gray-500">#{{ pokemon()!.id.toString().padStart(3, '0') }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <!-- Heart button for wishlist -->
                @if (pokemonFacade.isPokemonCaught(pokemon()!.id)) {
                  <app-custom-button
                    variant="heart"
                    [disabled]="true"
                    [wishlisted]="pokemonFacade.isPokemonInWishlist(pokemon()!.id)"
                  >
                  </app-custom-button>
                } @else {
                  <app-custom-button
                    variant="heart"
                    (buttonClick)="toggleWishlist()"
                    [wishlisted]="pokemonFacade.isPokemonInWishlist(pokemon()!.id)"
                  >
                  </app-custom-button>
                }

                <!-- Catch button -->
                <app-custom-button
                  (buttonClick)="pokemonFacade.catchPokemon(pokemon()!)"
                  [variant]="pokemonFacade.isPokemonCaught(pokemon()!.id) ? 'muted' : 'normal'"
                  [disabled]="pokemonFacade.isPokemonCaught(pokemon()!.id)"
                >
                  {{ pokemonFacade.isPokemonCaught(pokemon()!.id) ? 'Caught' : 'Catch Pokemon' }}
                </app-custom-button>
              </div>
            </div>
          </div>
        </header>

        <!-- Main content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Left Column: Images and Basic Info -->
            <div class="lg:col-span-1 space-y-6">
              <!-- Main Image -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="text-center">
                  @if (pokemon()!.officialArtwork) {
                    <app-lazy-image
                      [src]="pokemon()!.officialArtwork"
                      [alt]="pokemon()!.name"
                      imageClass="w-48 h-48 object-contain mx-auto mb-4"
                      containerClass="w-48 h-48 mx-auto mb-4"
                      placeholderClass="w-48 h-48"
                    />
                  } @else if (pokemon()!.imageUrl) {
                    <app-lazy-image
                      [src]="pokemon()!.imageUrl"
                      [alt]="pokemon()!.name"
                      imageClass="w-48 h-48 object-contain mx-auto mb-4"
                      containerClass="w-48 h-48 mx-auto mb-4"
                      placeholderClass="w-48 h-48"
                    />
                  } @else {
                    <div class="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  }

                  <!-- Pokemon Types -->
                  <div class="flex justify-center gap-2 mb-4">
                    @for (type of pokemon()!.types; track type) {
                      <span class="px-3 py-1 text-sm font-medium rounded-full"
                            [class]="pokemonFacade.getTypeClass(type)">
                        {{ type }}
                      </span>
                    }
                  </div>

                  <!-- Collection Status -->
                  <div class="flex justify-center gap-4">
                    <div class="text-center">
                      <div class="text-sm font-medium text-gray-700">Caught</div>
                      <div [class]="pokemonFacade.isPokemonCaught(pokemon()!.id) ? 'text-green-600 font-semibold' : 'text-gray-500'">
                        {{ pokemonFacade.isPokemonCaught(pokemon()!.id) ? 'Yes' : 'No' }}
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium text-gray-700">Wishlisted</div>
                      <div [class]="pokemonFacade.isPokemonInWishlist(pokemon()!.id) ? 'text-pink-600 font-semibold' : 'text-gray-500'">
                        {{ pokemonFacade.isPokemonInWishlist(pokemon()!.id) ? 'Yes' : 'No' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Images -->
              @if (pokemon()!.sprites) {
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Sprites</h3>
                  <div class="grid grid-cols-2 gap-4">
                    @if (pokemon()!.imageUrl) {
                      <div class="text-center">
                        <app-lazy-image
                          [src]="pokemon()!.imageUrl"
                          [alt]="pokemon()!.name + ' front default'"
                          imageClass="w-full h-20 object-contain bg-gray-50 rounded-lg"
                          containerClass="w-full h-20"
                          placeholderClass="w-full h-20"
                        />
                        <p class="text-xs text-gray-600 mt-1">Front Default</p>
                      </div>
                    }

                    @if (pokemon()!.sprites?.frontShiny) {
                      <div class="text-center">
                        <app-lazy-image
                          [src]="pokemon()!.sprites?.frontShiny!"
                          [alt]="pokemon()!.name + ' front shiny'"
                          imageClass="w-full h-20 object-contain bg-gray-50 rounded-lg"
                          containerClass="w-full h-20"
                          placeholderClass="w-full h-20"
                        />
                        <p class="text-xs text-gray-600 mt-1">Front Shiny</p>
                      </div>
                    }

                    @if (pokemon()!.sprites?.backDefault) {
                      <div class="text-center">
                        <app-lazy-image
                          [src]="pokemon()!.sprites?.backDefault!"
                          [alt]="pokemon()!.name + ' back default'"
                          imageClass="w-full h-20 object-contain bg-gray-50 rounded-lg"
                          containerClass="w-full h-20"
                          placeholderClass="w-full h-20"
                        />
                        <p class="text-xs text-gray-600 mt-1">Back Default</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Right Column: Detailed Information -->
            <div class="lg:col-span-2 space-y-6">

              <!-- Basic Information -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Basic Information</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">ID:</span>
                    <span class="text-gray-900">#{{ pokemon()!.id }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Name:</span>
                    <span class="text-gray-900 capitalize">{{ pokemon()!.name }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Height:</span>
                    <span class="text-gray-900">{{ (pokemon()!.height / 10).toFixed(1) }}m</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Weight:</span>
                    <span class="text-gray-900">{{ (pokemon()!.weight / 10).toFixed(1) }}kg</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="font-medium text-gray-700">Base Experience:</span>
                    <span class="text-gray-900">{{ pokemon()!.baseExperience || 'Unknown' }}</span>
                  </div>
                </div>
              </div>

              <!-- Abilities -->
              @if (pokemon()!.abilities && pokemon()!.abilities!.length > 0) {
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Abilities</h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (ability of pokemon()!.abilities!; track ability.name) {
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span class="text-gray-900 capitalize font-medium">{{ ability.name }}</span>
                        @if (ability.isHidden) {
                          <span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Hidden</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Stats -->
              @if (pokemon()!.stats && pokemon()!.stats.length > 0) {
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Base Stats</h3>

                  <div class="space-y-4">
                    @for (stat of pokemon()!.stats; track stat.name) {
                      <div class="flex items-center">
                        <div class="w-1/3">
                          <span class="text-sm font-medium text-gray-700 capitalize">{{ formatStatName(stat.name) }}</span>
                        </div>
                        <div class="w-16 text-right mr-4">
                          <span class="text-sm font-semibold text-gray-900">{{ stat.baseStat }}</span>
                        </div>
                        <div class="flex-1">
                          <div class="w-full bg-gray-200 rounded-full h-3">
                            <div
                              class="h-3 rounded-full transition-all duration-300"
                              [class]="getStatColor(stat.baseStat)"
                              [style.width.%]="(stat.baseStat / 255) * 100"
                            ></div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Moves -->
              @if (allMoves().length > 0) {
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">All Moves</h3>
                    <span class="text-sm text-gray-500">{{ allMoves().length }} total moves</span>
                  </div>

                  <!-- Move filters -->
                  <div class="mb-4">
                    <div class="flex flex-wrap gap-2">
                      @for (method of availableLearnMethods(); track method) {
                        <button
                          type="button"
                          (click)="toggleMoveFilter(method)"
                          class="px-3 py-1 text-sm rounded-full transition-all duration-200 capitalize"
                          [class]="selectedMoveFilters().has(method)
                            ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                        >
                          {{ formatLearnMethod(method) }}
                        </button>
                      }
                      @if (selectedMoveFilters().size > 0) {
                        <button
                          type="button"
                          (click)="clearMoveFilters()"
                          class="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                        >
                          Clear filters
                        </button>
                      }
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    @for (move of filteredMoves(); track move.name) {
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-gray-900 capitalize text-sm truncate">{{ formatMoveName(move.name) }}</div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                              {{ formatLearnMethod(move.learnMethod) }}
                            </span>
                            @if (move.levelLearnedAt && move.levelLearnedAt > 0) {
                              <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Lv. {{ move.levelLearnedAt }}
                              </span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  @if (filteredMoves().length === 0 && selectedMoveFilters().size > 0) {
                    <div class="text-center py-8">
                      <p class="text-gray-500">No moves found for selected filters.</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl text-gray-600">No Pokemon data available.</p>
        </div>
      </div>
    }
  `
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected pokemonFacade = inject(PokemonFacade);

  private destroy$ = new Subject<void>();
  protected pokemon = signal<Pokemon | null>(null);
  protected isLoading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected selectedMoveFilters = signal<Set<string>>(new Set());
  protected allMoves = computed(() => this.pokemon()?.moves || []);
  protected availableLearnMethods = computed(() => {
    const methods = new Set<string>();
    this.allMoves().forEach(move => methods.add(move.learnMethod));
    return Array.from(methods).sort();
  });

  protected filteredMoves = computed(() => {
    const moves = this.allMoves();
    const filters = this.selectedMoveFilters();

    if (filters.size === 0) {
      return moves;
    }

    return moves.filter(move => filters.has(move.learnMethod));
  });

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const pokemonId = params['id'];
        if (pokemonId) {
          this.loadPokemon(pokemonId);
        } else {
          this.error.set('No Pokemon ID provided');
          this.isLoading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPokemon(id: string | number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.pokemonFacade.getPokemonDetails(id).subscribe({
      next: (pokemon: Pokemon | null) => {
        if (pokemon) {
          this.pokemon.set(pokemon);
        } else {
          this.error.set('Pokemon not found');
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading Pokemon:', err);
        this.error.set('Failed to load Pokemon details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/pokemons']);
  }

  toggleWishlist(): void {
    const currentPokemon = this.pokemon();
    if (!currentPokemon) return;

    if (this.pokemonFacade.isPokemonInWishlist(currentPokemon.id)) {
      this.pokemonFacade.removeFromWishlist(currentPokemon.id);
    } else {
      this.pokemonFacade.addToWishlist(currentPokemon);
    }
  }

  toggleMoveFilter(method: string): void {
    const currentFilters = new Set(this.selectedMoveFilters());
    if (currentFilters.has(method)) {
      currentFilters.delete(method);
    } else {
      currentFilters.add(method);
    }
    this.selectedMoveFilters.set(currentFilters);
  }

  clearMoveFilters(): void {
    this.selectedMoveFilters.set(new Set());
  }

  formatStatName(statName: string): string {
    return statName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatMoveName(moveName: string): string {
    return moveName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatLearnMethod(method: string): string {
    switch (method) {
      case 'level-up':
        return 'Level Up';
      case 'machine':
        return 'TM/TR';
      case 'tutor':
        return 'Move Tutor';
      case 'egg':
        return 'Egg Move';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  }

  getStatColor(statValue: number): string {
    if (statValue >= 120) return 'bg-red-500';
    if (statValue >= 100) return 'bg-orange-500';
    if (statValue >= 80) return 'bg-yellow-500';
    if (statValue >= 60) return 'bg-green-500';
    if (statValue >= 40) return 'bg-blue-500';
    return 'bg-gray-400';
  }
}
