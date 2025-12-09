import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import { LoginUserRequest, RegisterUserRequest, SetPasswordRequest } from '../api/dtos';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(body: RegisterUserRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/auth/register`, body);
  }

  login(body: LoginUserRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/auth/login`, body);
  }

  setPassword(body: SetPasswordRequest) {
    return this.http.patch(`${API_BASE_URL}/api/v1/auth/password`, body);
  }
}
