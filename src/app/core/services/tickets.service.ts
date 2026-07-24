import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api/api.config';
import {
  CreateTicketRequest,
  PostCommentRequest,
  TicketDetailsDto,
  TicketSummaryDto,
} from '../api/dtos';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  constructor(private http: HttpClient) {}

  create(body: CreateTicketRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/tickets`, body);
  }

  getAll(): Observable<TicketSummaryDto[]> {
    return this.http.get<TicketSummaryDto[]>(`${API_BASE_URL}/api/v1/tickets`);
  }

  getMy() {
    return this.http.get<TicketSummaryDto[]>(`${API_BASE_URL}/api/v1/tickets/my`);
  }

  getQueue() {
    return this.http.get<TicketSummaryDto[]>(`${API_BASE_URL}/api/v1/tickets/queue`);
  }

  getById(ticketId: string): Observable<TicketDetailsDto | null> {
    return this.http.get<TicketDetailsDto>(`${API_BASE_URL}/api/v1/tickets/${ticketId}`);
  }

  postComment(ticketId: string, body: PostCommentRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/tickets/${ticketId}/comment`, body);
  }

  complete(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/complete`, {});
  }

  reopen(ticketId: string, reason: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/reopen`, {
      reason: reason,
    });
  }

  fail(ticketId: string, reason: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/fail`, {
      reason: reason,
    });
  }

  cancel(ticketId: string, reason: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/cancel`, {
      reason: reason,
    });
  }

  take(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/take`, {});
  }

  accept(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/accept`, {});
  }

  startWork(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/start-work`, {});
  }
}
