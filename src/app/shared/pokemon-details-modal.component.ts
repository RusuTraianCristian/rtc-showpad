import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../core/models/pokemon.model';
import { PokemonFacade } from '../core/facades/pokemon.facade';
import { inject } from '@angular/core';
import { CustomButtonComponent } from './custom-button.component';

@Component({
  selector: 'app-pokemon-details-modal',
  imports: [CommonModule, CustomButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pokemon()) {
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" (click)="closeModal.emit()">
        <!-- Modal Content -->
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div class="flex items-center gap-4">
              @if (pokemon()!.officialArtwork) {
                <img
                  [src]="pokemon()!.officialArtwork"
                  [alt]="pokemon()!.name"
                  class="w-16 h-16 object-contain"
                />
              } @else if (pokemon()!.imageUrl) {
                <img
                  [src]="pokemon()!.imageUrl"
                  [alt]="pokemon()!.name"
                  class="w-16 h-16 object-contain"
                />
              }
              <div>
                <h2 class="text-2xl font-bold text-gray-900 capitalize">{{ pokemon()!.name }}</h2>
                <p class="text-gray-500">#{{ pokemon()!.id.toString().padStart(3, '0') }}</p>
              </div>
            </div>
            <button
              (click)="closeModal.emit()"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>

                <div class="space-y-3">
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

              <!-- Right Column -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Types</h3>

                <div class="flex flex-wrap gap-2">
                  @for (type of pokemon()!.types; track type) {
                    <span class="px-3 py-1 text-sm font-medium rounded-full"
                          [class]="pokemonFacade.getTypeClass(type)">
                      {{ type }}
                    </span>
                  }
                </div>

                @if (pokemon()!.abilities && pokemon()!.abilities!.length > 0) {
                  <div class="mt-4">
                    <h4 class="font-medium text-gray-700 mb-2">Abilities:</h4>
                    <div class="space-y-1">
                      @for (ability of pokemon()!.abilities!; track ability.name) {
                        <div class="flex items-center gap-2">
                          <span class="text-gray-900 capitalize">{{ ability.name }}</span>
                          @if (ability.isHidden) {
                            <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Hidden</span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Stats -->
            @if (pokemon()!.stats && pokemon()!.stats.length > 0) {
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Base Stats</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (stat of pokemon()!.stats; track stat.name) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span class="font-medium text-gray-700 capitalize">{{ formatStatName(stat.name) }}:</span>
                      <div class="flex items-center gap-2">
                        <span class="text-gray-900 font-semibold">{{ stat.baseStat }}</span>
                        <div class="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
            @if (pokemon()!.moves && pokemon()!.moves.length > 0) {
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Moves (First 20)</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (move of pokemon()!.moves; track move.name) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div class="flex-1">
                        <span class="font-medium text-gray-900 capitalize">{{ formatMoveName(move.name) }}</span>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {{ formatLearnMethod(move.learnMethod) }}
                          </span>
                          @if (move.levelLearnedAt && move.levelLearnedAt > 0) {
                            <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Level {{ move.levelLearnedAt }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Images -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Images</h3>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @if (pokemon()!.officialArtwork) {
                  <div class="text-center">
                    <img
                      [src]="pokemon()!.officialArtwork"
                      [alt]="pokemon()!.name + ' official artwork'"
                      class="w-full h-24 object-contain bg-gray-50 rounded-lg"
                    />
                    <p class="text-xs text-gray-600 mt-1">Official Artwork</p>
                  </div>
                }

                @if (pokemon()!.imageUrl) {
                  <div class="text-center">
                    <img
                      [src]="pokemon()!.imageUrl"
                      [alt]="pokemon()!.name + ' sprite'"
                      class="w-full h-24 object-contain bg-gray-50 rounded-lg"
                    />
                    <p class="text-xs text-gray-600 mt-1">Front Default</p>
                  </div>
                }

                @if (pokemon()!.sprites) {
                  @if (pokemon()!.sprites?.frontShiny) {
                    <div class="text-center">
                      <img
                        [src]="pokemon()!.sprites?.frontShiny!"
                        [alt]="pokemon()!.name + ' shiny sprite'"
                        class="w-full h-24 object-contain bg-gray-50 rounded-lg"
                      />
                      <p class="text-xs text-gray-600 mt-1">Front Shiny</p>
                    </div>
                  }

                  @if (pokemon()!.sprites?.backDefault) {
                    <div class="text-center">
                      <img
                        [src]="pokemon()!.sprites?.backDefault!"
                        [alt]="pokemon()!.name + ' back sprite'"
                        class="w-full h-24 object-contain bg-gray-50 rounded-lg"
                      />
                      <p class="text-xs text-gray-600 mt-1">Back Default</p>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Status -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Collection Status</h3>

              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-700">Caught:</span>
                  <span [class]="pokemonFacade.isPokemonCaught(pokemon()!.id) ? 'text-green-600 font-semibold' : 'text-gray-500'">
                    {{ pokemonFacade.isPokemonCaught(pokemon()!.id) ? 'Yes' : 'No' }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-700">Wishlisted:</span>
                  <span [class]="pokemonFacade.isPokemonInWishlist(pokemon()!.id) ? 'text-pink-600 font-semibold' : 'text-gray-500'">
                    {{ pokemonFacade.isPokemonInWishlist(pokemon()!.id) ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <app-custom-button
              (buttonClick)="closeModal.emit()"
              variant="muted"
            >
              Close
            </app-custom-button>
          </div>
        </div>
      </div>
    }
  `
})
export class PokemonDetailsModalComponent {
  pokemon = input<Pokemon | null>(null);
  closeModal = output<void>();

  protected pokemonFacade = inject(PokemonFacade);

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
}
