import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.config';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  constructor(private http: HttpClient) {}

  getLogs(page: number, pageSize: number) {
    const params = new HttpParams().set('Page', page).set('PageSize', pageSize);
    return this.http.get(`${API_BASE_URL}/api/v1/logs`, { params });
  }

  getLogsByTicket(ticketId: string) {
    return this.http.get(`${API_BASE_URL}/api/v1/logs/ticket/${ticketId}`);
  }
}
