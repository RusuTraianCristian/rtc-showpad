import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pokemons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Pokemons</h2>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-gray-600 text-center py-8">
          Pokemon list coming soon...
        </p>
      </div>
    </div>
  `
})
export class PokemonsComponent {}
