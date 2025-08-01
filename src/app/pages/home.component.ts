import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CustomButtonComponent } from '../shared/custom-button.component';

@Component({
  selector: 'app-home',
  imports: [CustomButtonComponent],
  template: `
    <div class="main flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 class="text-8xl font-bold text-black">Pokedex</h1>
      <p class="text-base text-black text-xl font-semibold">Explore the world of Pokémon.</p>
      <app-custom-button (buttonClick)="goToDashboard()">
        Go to Dashboard
      </app-custom-button>
    </div>
  `
})
export class HomeComponent {
  private router = inject(Router);

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
