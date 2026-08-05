import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import { ActivityLogDto } from '../api/dtos/activity-log.dto';
import { PaginationResponse } from '../api/dtos/pagination-response.dto';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  constructor(private http: HttpClient) {}

  getLogs(page: number, pageSize: number) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginationResponse<ActivityLogDto>>(`${API_BASE_URL}/api/v1/logs`, {
      params,
    });
  }

  getLogsByTicket(ticketId: string, page: number = 1, pageSize: number = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginationResponse<ActivityLogDto>>(
      `${API_BASE_URL}/api/v1/logs/ticket/${ticketId}`,
      { params }
    );
  }
}
