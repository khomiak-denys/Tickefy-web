import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

export const settingsRoutes: Routes = [
  {
    path: 'settings',
    children: [
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('../features/settings/components/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
      {
        path: 'profile/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('../features/settings/components/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
      },
    ],
  },
];
