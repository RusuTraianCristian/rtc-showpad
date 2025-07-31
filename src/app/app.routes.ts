import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { HomeComponent } from './pages/home.component';
import { DashboardOverviewComponent } from './pages/dashboard-overview.component';
import { PokemonsComponent } from './pages/pokemons.component';
import { CollectionComponent } from './pages/collection.component';
import { PokemonDetailComponent } from './pages/pokemon-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardOverviewComponent
      },
      {
        path: 'pokemons',
        component: PokemonsComponent,
        canActivate: [authGuard]
      },
      {
        path: 'pokemon/:id',
        component: PokemonDetailComponent,
        canActivate: [authGuard]
      },
      {
        path: 'collection',
        component: CollectionComponent,
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
