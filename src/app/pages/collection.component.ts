import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CustomButtonComponent } from '../shared/custom-button.component';

@Component({
  selector: 'app-collection',
  imports: [CustomButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h2 class="text-3xl font-bold text-gray-900 mb-6">My Collection</h2>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Your Collection is Empty</h3>
          <p class="text-gray-600 mb-6">
            Start collecting your favorite Pokemon! Browse the Pokemon list and add them to your collection.
          </p>
          <app-custom-button
            routerLink="/dashboard/pokemons"
            additionalClasses="inline-flex items-center"
          >
            Browse Pokemon
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </app-custom-button>
        </div>
      </div>
    </div>
  `
})
export class CollectionComponent {}
