import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import {decodeJwtPayload, validateJwtClaims} from '../../shared/helpers/jwt.util';
import {JWT_AUDIENCE, JWT_ISSUER} from './jwt.config';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate(): boolean | UrlTree {

    const token = localStorage.getItem('access_token');
    if (!token) return this.router.createUrlTree(['/auth/login']);

    const payload = decodeJwtPayload(token);
    if (!payload) return this.router.createUrlTree(['/auth/login']);

    const result = validateJwtClaims(payload, {iss: JWT_ISSUER, aud: JWT_AUDIENCE});
    if (!result.valid) return this.router.createUrlTree(['/auth/login']);

    return true;
  }
}
