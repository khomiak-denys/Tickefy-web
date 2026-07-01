import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    if (!this.authService.isLoggedIn()) {
      return this.authService.refreshToken().pipe(
        map(result => {
        this.authService.saveToken(result.token);
        return true;
      }),
        catchError(error => {
          return of(this.router.createUrlTree(['/auth/login']));
        })
      );
    }

    return of(true);
  }
}
