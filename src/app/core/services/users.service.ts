import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import {SetUserRoleRequest, UpdateProfileRequest, UserDto} from '../api/dtos';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(`${API_BASE_URL}/api/v1/users`);
  }

  getById(userId: string) {
    return this.http.get(`${API_BASE_URL}/api/v1/users/${userId}`);
  }

  getByLogin(login: string) {
    return this.http.get(`${API_BASE_URL}/api/v1/users/login/${encodeURIComponent(login)}`);
  }

  delete(userId: string) {
    return this.http.delete(`${API_BASE_URL}/api/v1/users/${userId}`);
  }

  setRole(userId: string, body: SetUserRoleRequest) {
    return this.http.patch(`${API_BASE_URL}/api/v1/users/${userId}`, body);
  }

  me() {
    return this.http.get<UserDto>(`${API_BASE_URL}/api/v1/users/me`);
  }

  updateProfile(body: UpdateProfileRequest) {
    return this.http.patch(`${API_BASE_URL}/api/v1/users/update-profile`, body);
  }
}
