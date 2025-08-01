import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../services/app-state.service';
import { UserModalComponent, CustomButtonComponent, StatCardComponent } from '../shared';
import { UserPokemon } from '../core';

@Component({
  selector: 'app-dashboard-overview',
  imports: [RouterLink, UserModalComponent, CustomButtonComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (appState.userLoading()) {
      <!-- Loading State -->
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    } @else if (showUserModal()) {
      <!-- User Input Modal -->
      <app-user-modal (userSaved)="onUserSaved($event)" />
    } @else if (showDashboard()) {
      <!-- Dashboard Content -->
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Overview</h2>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <app-stat-card
            title="Caught Pokemon"
            [value]="appState.caughtPokemonCount()"
            description="In your collection"
            numberColor="#16a34a"
          />
          <app-stat-card
            title="Wishlist"
            [value]="appState.wishlistPokemonCount()"
            description="Pokemon you want"
            numberColor="#9333ea"
          />
        </div>

        <!-- Recent Activity / Getting Started -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Your Pokemon Journey</h3>

          @if (appState.caughtPokemonCount() === 0 && appState.wishlistPokemonCount() === 0) {
            <!-- Getting Started Message -->
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Start Your Adventure!</h4>
              <p class="text-gray-600 mb-4">
                Welcome to your Pokemon journey! Start by exploring the Pokemon collection and adding some to your wishlist or catching your first Pokemon.
              </p>
              <div class="flex justify-center gap-4">
                <a
                  routerLink="/dashboard/pokemons"
                  class="inline-flex items-center justify-center min-h-[50px] px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white font-medium text-lg rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-500 transition-all duration-200"
                >
                  Explore Pokemon
                </a>
              </div>
            </div>
          } @else {
            <!-- Pokemon Stats Summary -->
            <div class="space-y-4">
              @if (appState.caughtPokemonCount() > 0) {
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span class="text-gray-700">Pokemon Caught</span>
                  </div>
                  <span class="text-sm font-semibold text-green-600">{{ appState.caughtPokemonCount() }} Pokemon</span>
                </div>
              }

              @if (appState.wishlistPokemonCount() > 0) {
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </div>
                    <span class="text-gray-700">Wishlist Items</span>
                  </div>
                  <span class="text-sm font-semibold text-purple-600">{{ appState.wishlistPokemonCount() }} Pokemon</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- Debug State -->
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <p class="text-xl text-red-600">Debug Mode</p>
          <div class="text-sm text-gray-600 mt-4 space-y-1">
            <p>User Loading: {{ appState.userLoading() }}</p>
            <p>Has User: {{ appState.hasUser() }}</p>
            <p>User Name: {{ appState.userName() }}</p>
            <p>Caught Pokemon: {{ appState.caughtPokemonCount() }}</p>
            <p>Wishlist Pokemon: {{ appState.wishlistPokemonCount() }}</p>
            <p>Show Modal: {{ showUserModal() }}</p>
            <p>Show Dashboard: {{ showDashboard() }}</p>
          </div>

          @if (appState.hasUser()) {
            <div class="mt-6 space-y-2">
              <p class="text-sm font-semibold text-gray-700">Test Pokemon Operations:</p>
              <div class="flex gap-2 justify-center">
                <app-custom-button
                  (buttonClick)="testAddCaughtPokemon()"
                  additionalClasses="!h-8 !line-height-8 !text-xs !px-3"
                >
                  Catch Pikachu
                </app-custom-button>
                <app-custom-button
                  (buttonClick)="testAddToWishlist()"
                  additionalClasses="!h-8 !line-height-8 !text-xs !px-3"
                >
                  Wishlist Charizard
                </app-custom-button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class DashboardOverviewComponent {
  protected appState = inject(AppStateService);
  showUserModal = computed(() =>
    !this.appState.userLoading() && !this.appState.hasUser()
  );

  showDashboard = computed(() =>
    !this.appState.userLoading() && this.appState.hasUser()
  );

  onUserSaved(userName: string): void {
    this.appState.setUser(userName);
  }
  testAddCaughtPokemon(): void {
    const testPokemon: UserPokemon = {
      id: 25,
      name: 'Pikachu',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    };
    this.appState.addCaughtPokemon(testPokemon);
  }

  testAddToWishlist(): void {
    const testPokemon: UserPokemon = {
      id: 6,
      name: 'Charizard',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
    };
    this.appState.addToWishlist(testPokemon);
  }
}
