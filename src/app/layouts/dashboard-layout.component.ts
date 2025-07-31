import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';
import { CustomButtonComponent } from '../shared/custom-button.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CustomButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Fixed Sidebar -->
      <aside
        class="fixed top-0 left-0 h-full bg-black text-white z-40 transition-transform duration-300 ease-in-out"
        [class.w-64]="sidebarOpen()"
        [class.w-16]="!sidebarOpen()"
      >
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-gray-700">
          <div class="flex items-center justify-between">
            @if (sidebarOpen()) {
              <h1 class="text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors" (click)="navigateToHome()">Pokedex</h1>
            }
            <button
              (click)="toggleSidebar()"
              class="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              @if (sidebarOpen()) {
                <!-- Close icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              } @else {
                <!-- Menu icon -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="p-4 space-y-2">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-gray-700"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center rounded-lg hover:bg-gray-800 transition-colors"
            [class.px-3]="sidebarOpen()"
            [class.py-2]="sidebarOpen()"
            [class.justify-center]="!sidebarOpen()"
            [class.p-3]="!sidebarOpen()"
            [title]="!sidebarOpen() ? 'Overview' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
            </svg>
            @if (sidebarOpen()) {
              <span class="ml-3">Overview</span>
            }
          </a>

          <a
            routerLink="/dashboard/pokemons"
            routerLinkActive="bg-gray-700"
            class="flex items-center rounded-lg hover:bg-gray-800 transition-colors"
            [class.px-3]="sidebarOpen()"
            [class.py-2]="sidebarOpen()"
            [class.justify-center]="!sidebarOpen()"
            [class.p-3]="!sidebarOpen()"
            [title]="!sidebarOpen() ? 'Pokemons' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path>
            </svg>
            @if (sidebarOpen()) {
              <span class="ml-3">Pokemons</span>
            }
          </a>

          <a
            routerLink="/dashboard/collection"
            routerLinkActive="bg-gray-700"
            class="flex items-center rounded-lg hover:bg-gray-800 transition-colors"
            [class.px-3]="sidebarOpen()"
            [class.py-2]="sidebarOpen()"
            [class.justify-center]="!sidebarOpen()"
            [class.p-3]="!sidebarOpen()"
            [title]="!sidebarOpen() ? 'My Collection' : ''"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            @if (sidebarOpen()) {
              <span class="ml-3">My Collection</span>
            }
          </a>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div
        class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        [class.ml-64]="sidebarOpen()"
        [class.ml-16]="!sidebarOpen()"
      >
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200 h-[70px]">
          <div class="px-6 py-4 h-full">
            <div class="flex items-center justify-between h-full">
              <div class="flex items-center">
                <h2 class="text-2xl font-semibold text-gray-900">Dashboard</h2>
              </div>

              <!-- Welcome Message and Disconnect Button -->
              <div class="flex items-center gap-6">
                @if (appState.userName()) {
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Welcome back,</p>
                    <p class="text-lg font-semibold text-gray-900">{{ appState.userName() }}!</p>
                  </div>
                }
                <app-custom-button
                  variant="muted"
                  (buttonClick)="disconnect()"
                >
                  Disconnect
                </app-custom-button>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  protected appState = inject(AppStateService);
  private router = inject(Router);

  // Window width signal for responsive behavior
  private windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Track the current screen size category (desktop/mobile)
  private isDesktop = signal(typeof window !== 'undefined' ? window.innerWidth >= 800 : true);

  // Track if user has manually toggled sidebar within current screen size category
  private userHasToggled = signal(false);

  // Computed signal for default sidebar state based on screen size
  private defaultSidebarOpen = computed(() => this.windowWidth() >= 800);

  // Sidebar toggle state - starts with responsive default
  protected sidebarOpen = signal(typeof window !== 'undefined' ? window.innerWidth >= 800 : true);

  constructor() {
    // Listen for window resize events
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        this.windowWidth.set(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      // Update sidebar state when screen size changes
      effect(() => {
        const currentIsDesktop = this.windowWidth() >= 800;
        const wasDesktop = this.isDesktop();

        // If we've crossed the breakpoint (desktop <-> mobile), reset manual toggle flag
        if (currentIsDesktop !== wasDesktop) {
          this.userHasToggled.set(false);
          this.isDesktop.set(currentIsDesktop);
        }

        // Update sidebar state if user hasn't manually toggled in current screen size category
        if (!this.userHasToggled()) {
          const defaultState = this.defaultSidebarOpen();
          this.sidebarOpen.set(defaultState);
        }
      });
    }
  }

  protected toggleSidebar(): void {
    this.userHasToggled.set(true);
    this.sidebarOpen.update(open => !open);
  }

  protected navigateToHome(): void {
    this.router.navigate(['/']);
  }

  disconnect(): void {
    console.log('Disconnecting user...');
    this.appState.clearUser();
    this.router.navigate(['/']);
  }
}
