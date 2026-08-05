import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import { SetUserRoleRequest, UpdateProfileRequest, UserDto } from '../api/dtos';
import { PaginationResponse } from '../api/dtos/pagination-response.dto';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getAll(page: number = 1, pageSize: number = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginationResponse<UserDto>>(`${API_BASE_URL}/api/v1/users`, { params });
  }

  getById(userId: string) {
    return this.http.get<UserDto>(`${API_BASE_URL}/api/v1/users/${userId}`);
  }

  delete(userId: string) {
    return this.http.delete<void>(`${API_BASE_URL}/api/v1/users/${userId}`);
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
