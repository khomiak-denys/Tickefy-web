import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('access_token');
    if (token && token.length > 0) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}
