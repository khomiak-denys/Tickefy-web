import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import { CreateTeamRequest, TeamDetails, TeamSummary } from '../api/dtos';

import { PaginationResponse } from '../api/dtos/pagination-response.dto';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private http: HttpClient) {}

  create(body: CreateTeamRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/teams`, body);
  }

  getAll(page: number = 1, pageSize: number = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginationResponse<TeamSummary>>(`${API_BASE_URL}/api/v1/teams`, {
      params,
    });
  }

  getById(teamId: string) {
    return this.http.get<TeamDetails>(`${API_BASE_URL}/api/v1/teams/${teamId}`);
  }

  delete(teamId: string) {
    return this.http.delete(`${API_BASE_URL}/api/v1/teams/${teamId}`);
  }

  addMember(teamId: string, memberId: string) {
    return this.http.patch(`${API_BASE_URL}/api/v1/teams/${teamId}/members/${memberId}`, {});
  }

  addMemberByLogin(teamId: string, login: string) {
    // Backend resolves user by login provided in request body via PATCH
    return this.http.patch(`${API_BASE_URL}/api/v1/teams/${teamId}/members`, { login });
  }

  removeMember(teamId: string, memberId: string) {
    return this.http.delete(`${API_BASE_URL}/api/v1/teams/${teamId}/members/${memberId}`);
  }

  getMy(page: number = 1, pageSize: number = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginationResponse<TeamSummary>>(`${API_BASE_URL}/api/v1/teams/my`, {
      params,
    });
  }
}
