import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import { LoginUserRequest, RegisterUserRequest, UserDto } from '../api/dtos';
import { decodeJwtPayload, validateJwtClaims } from '../../shared/helpers/jwt.util';
import { JwtPayload } from '../../shared/helpers/dto/jwt.payload';
import { JWT_AUDIENCE, JWT_ISSUER } from '../guards/jwt.config';
import { AuthDto } from '../api/dtos/auth.dto';
import { shareReplay, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {
    this.firstName$.next(localStorage.getItem('user_firstName'));
    this.lastName$.next(localStorage.getItem('user_lastName'));
  }

  private currentUser: JwtPayload | null = null;
  private token$: Observable<AuthDto> | null = null;

  public firstName$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public lastName$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  register(body: RegisterUserRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/auth/register`, body);
  }

  login(body: LoginUserRequest) {
    return this.http.post<AuthDto>(`${API_BASE_URL}/api/v1/auth/login`, body, {
      withCredentials: true,
    });
  }

  refreshToken() {
    if (!this.token$) {
      this.token$ = this.http
        .post<AuthDto>(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          shareReplay(1),
          finalize(() => {
            this.token$ = null;
          })
        );
    }

    return this.token$;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): JwtPayload | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = localStorage.getItem('access_token') || '';
    const payload = token ? decodeJwtPayload(token) : null;
    this.currentUser = payload;

    return payload;
  }

  clearCurrentUser() {
    this.currentUser = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_firstName');
    localStorage.removeItem('user_lastName');
  }

  getRole(): string | null {
    const payload = this.getCurrentUser();
    if (!payload) {
      return null;
    }

    return payload.role.toLowerCase();
  }

  isLoggedIn(): boolean {
    const payload = this.getCurrentUser();
    if (!payload) {
      return false;
    }

    const result = validateJwtClaims(payload, { iss: JWT_ISSUER, aud: JWT_AUDIENCE });
    return result.valid;
  }

  saveUserProfile(firstName: string | null, lastName: string | null): void {
    if (firstName) {
      localStorage.setItem('user_firstName', firstName);
      this.firstName$.next(firstName);
    }

    if (lastName) {
      localStorage.setItem('user_lastName', lastName);
      this.lastName$.next(lastName);
    }
  }

  saveUserFromProfile(user: UserDto): void {
    this.saveUserProfile(user.firstName, user.lastName);
  }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }
}
