import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

export const settingsRoutes: Routes = [
  {
    path: 'settings',
    children: [
      {
        path: 'profile',
        canActivate: [AuthGuard],
        // Same component handles own profile (no :id) and delegated view/edit via :id
        loadComponent: () =>
          import('../features/settings/components/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
      {
        path: 'profile/:id',
        canActivate: [AuthGuard],
        // If :id present, ProfilePageComponent fetches that user; see component logic
        loadComponent: () =>
          import('../features/settings/components/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
    ],
  },
];
