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
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <div class="text-right">
            <p class="text-sm text-gray-500">Welcome back,</p>
            <p class="text-lg font-semibold text-gray-900">{{ appState.userName() }}!</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Pokemon</h3>
            <p class="text-3xl font-bold text-blue-600">1,010</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Caught</h3>
            <p class="text-3xl font-bold text-green-600">142</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
            <p class="text-3xl font-bold text-purple-600">23</p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-gray-700">Caught Pikachu</span>
              <span class="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-gray-700">Added Charizard to favorites</span>
              <span class="text-sm text-gray-500">1 day ago</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-gray-700">Completed Kanto Pokedex</span>
              <span class="text-sm text-gray-500">3 days ago</span>
            </div>
          </div>
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
            <p>Show Modal: {{ showUserModal() }}</p>
            <p>Show Dashboard: {{ showDashboard() }}</p>
          </div>
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
}
