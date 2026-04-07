import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map.page').then( m => m.MapPage)
  },
  {
    path: 'hotel-filters',
    loadComponent: () => import('./pages/hotel-filters/hotel-filters.page').then(m => m.HotelFiltersPage)
  },
  {
    path: 'restaurant-filters',
    loadComponent: () => import('./pages/restaurant-filters/restaurant-filters.page').then(m => m.RestaurantFiltersPage)
  },
  {
    path: 'tourism-filters',
    loadComponent: () => import('./pages/tourism-filters/tourism-filters.page').then(m => m.TourismFiltersPage)
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then(m => m.ResultsPage)
  },
];
