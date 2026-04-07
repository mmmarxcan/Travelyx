import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './pages/dashboard/layout/layout';
import { Overview } from './pages/dashboard/overview/overview';
import { Places } from './pages/dashboard/places/places';
import { Users } from './pages/dashboard/users/users';
import { Settings } from './pages/dashboard/settings/settings';
import { OwnerLayout } from './pages/owner/layout/layout';
import { OwnerDashboard } from './pages/owner/dashboard/dashboard';
import { OwnerPlaces } from './pages/owner/places/places';
import { OwnerProfile } from './pages/owner/profile/profile';
import { adminGuard, ownerGuard } from './guards/guards';

export const routes: Routes = [
  { path: 'login', component: Login },

  // Panel SuperAdmin
  {
    path: 'dashboard',
    component: Layout,
    canActivate: [adminGuard],
    children: [
      { path: '',        component: Overview  },
      { path: 'places',  component: Places    },
      { path: 'users',   component: Users     },
      { path: 'settings', component: Settings },
    ]
  },

  // Panel Propietario
  {
    path: 'owner',
    component: OwnerLayout,
    canActivate: [ownerGuard],
    children: [
      { path: '',         redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OwnerDashboard },
      { path: 'places',    component: OwnerPlaces    },
      { path: 'profile',   component: OwnerProfile   },
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
