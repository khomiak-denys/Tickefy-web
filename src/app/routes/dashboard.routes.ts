import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../features/dashboard/components/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      ),
  },
];
