import { Component, inject, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AppStateService } from '../services/app-state.service';
import { UserModalComponent } from '../shared/user-modal.component';

@Component({
  selector: 'app-dashboard-overview',
  imports: [UserModalComponent],
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
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Pokemon</h3>
            <p class="text-3xl font-bold text-blue-600">1,010</p>
            <p class="text-sm text-gray-500 mt-1">Available to catch</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Caught Pokemon</h3>
            <p class="text-3xl font-bold text-green-600">{{ appState.caughtPokemonCount() }}</p>
            <p class="text-sm text-gray-500 mt-1">In your collection</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Wishlist</h3>
            <p class="text-3xl font-bold text-purple-600">{{ appState.wishlistPokemonCount() }}</p>
            <p class="text-sm text-gray-500 mt-1">Pokemon you want</p>
          </div>
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
                  href="/dashboard/pokemons"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

              <div class="flex items-center justify-between py-3">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <span class="text-gray-700">Progress</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ ((appState.caughtPokemonCount() / 1010) * 100).toFixed(1) }}% Complete</span>
              </div>
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
                <button
                  (click)="testAddCaughtPokemon()"
                  class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Catch Pikachu
                </button>
                <button
                  (click)="testAddToWishlist()"
                  class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  Wishlist Charizard
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class DashboardOverviewComponent implements OnInit {
  protected appState = inject(AppStateService);

  // Computed signals for UI logic
  showUserModal = computed(() =>
    !this.appState.userLoading() && !this.appState.hasUser()
  );

  showDashboard = computed(() =>
    !this.appState.userLoading() && this.appState.hasUser()
  );

  ngOnInit(): void {
    console.log('Dashboard component initializing...');
    this.appState.initializeUserState();
  }

  onUserSaved(userName: string): void {
    console.log('User saved from modal:', userName);
    this.appState.setUser(userName);
  }

  // Test methods for Pokemon operations (for demonstration)
  testAddCaughtPokemon(): void {
    this.appState.addCaughtPokemon({
      id: 25,
      name: 'Pikachu',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    });
  }

  testAddToWishlist(): void {
    this.appState.addToWishlist({
      id: 6,
      name: 'Charizard',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
    });
  }
}
