import { Routes } from '@angular/router';
import { dashboardRoutes } from './dashboard.routes';
import { settingsRoutes } from './settings.routes';
import { authRoutes } from './auth.routes';

export const routes: Routes = [
  ...dashboardRoutes,
  ...settingsRoutes,
  ...authRoutes,
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
