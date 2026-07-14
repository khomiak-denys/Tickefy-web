import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CreateTicketRequest, TicketSummaryDto } from '../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { TicketsService } from '../../../core/services/tickets.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardTicketService {
  private queueSource = new BehaviorSubject<TicketSummaryDto[]>([]);
  private mySource = new BehaviorSubject<TicketSummaryDto[]>([]);
  private allSource = new BehaviorSubject<TicketSummaryDto[]>([]);

  private statusFilter$ = new BehaviorSubject<string>('all');
  private priorityFilter$ = new BehaviorSubject<string>('all');
  private typeFilter$ = new BehaviorSubject<string>('all');

  filteredQueueTickets$ = this.filterTickets(this.queueSource);
  filteredMyTickets$ = this.filterTickets(this.mySource);
  filteredAllTickets$ = this.filterTickets(this.allSource);

  private errors$ = new BehaviorSubject<string | null>(null);
  readonly ticketError$ = this.errors$.asObservable();

  constructor(
    private auth: AuthService,
    private tickets: TicketsService
  ) {}

  private filterTickets(stream$: Observable<TicketSummaryDto[]>) {
    return combineLatest([
      stream$,
      this.statusFilter$,
      this.typeFilter$,
      this.priorityFilter$,
    ]).pipe(
      map(([source, statusFilter, typeFilter, priorityFilter]) => {
        const norm = (v: string | null) => String(v || '').toLowerCase();
        return source.filter((ticket: TicketSummaryDto) => {
          const statusOk = statusFilter === 'all' || norm(ticket.status).includes(statusFilter);
          const typeOk = typeFilter === 'all' || norm(ticket.category) === typeFilter;
          const priorityOk = priorityFilter === 'all' || norm(ticket.priority) === priorityFilter;

          return statusOk && priorityOk && typeOk;
        });
      })
    );
  }

  loadTickets(): void {
    const role = this.auth.getRole();

    const isAgent = role === 'agent';
    const isAdmin = role === 'admin';

    if (isAgent) {
      this.tickets.getQueue().subscribe({
        next: (data) => {
          this.queueSource.next(data);
        },
        error: () => {},
      });

      this.tickets.getMy().subscribe({
        next: (data) => {
          this.mySource.next(data);
        },
        error: () => {},
      });
    } else {
      if (isAdmin) {
        this.tickets.getAll().subscribe({
          next: (data) => {
            this.allSource.next(data);
          },
          error: () => {},
        });
      } else {
        this.tickets.getMy().subscribe({
          next: (data) => {
            this.mySource.next(data);
          },
          error: () => {},
        });
      }
    }
  }

  createTicket(req: CreateTicketRequest) {
    return this.tickets.create(req).pipe(tap(() => this.loadTickets()));
  }

  filterByStatus(status: string): void {
    this.statusFilter$.next(status);
  }

  filterByPriority(priority: string): void {
    this.priorityFilter$.next(priority);
  }

  filterByType(priority: string): void {
    this.typeFilter$.next(priority);
  }
}
