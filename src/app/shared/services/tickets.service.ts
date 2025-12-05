import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.config';
import { CreateTicketRequest, PostCommentRequest } from '../../core/api/dtos';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  constructor(private http: HttpClient) {}

  create(body: CreateTicketRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/tickets`, body);
  }

  getAll() {
    return this.http.get(`${API_BASE_URL}/api/v1/tickets`);
  }

  getMy() {
    return this.http.get(`${API_BASE_URL}/api/v1/tickets/my`);
  }

  getById(ticketId: string) {
    return this.http.get(`${API_BASE_URL}/api/v1/tickets/${ticketId}`);
  }

  postComment(ticketId: string, body: PostCommentRequest) {
    return this.http.post(`${API_BASE_URL}/api/v1/tickets/${ticketId}/comment`, body);
  }

  complete(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/complete`, {});
  }

  revise(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/revise`, {});
  }

  cancel(ticketId: string) {
    return this.http.put(`${API_BASE_URL}/api/v1/tickets/${ticketId}/cancel`, {});
  }
}
