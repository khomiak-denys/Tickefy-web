import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, tap } from 'rxjs';
import { CreateTicketRequest, TicketSummaryDto } from '../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { TicketsService } from '../../../core/services/tickets.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PaginationResponse } from '../../../core/api/dtos/pagination-response.dto';

export type TicketTabKeys = 'queue' | 'my' | 'all';

@Injectable({
  providedIn: 'root',
})
export class DashboardTicketService {
  private queueSource = new BehaviorSubject<TicketSummaryDto[] | null>(null);
  private mySource = new BehaviorSubject<TicketSummaryDto[] | null>(null);
  private allSource = new BehaviorSubject<TicketSummaryDto[] | null>(null);

  private statusFilter$ = new BehaviorSubject<string>('all');
  private priorityFilter$ = new BehaviorSubject<string>('all');
  private typeFilter$ = new BehaviorSubject<string>('all');

  filteredQueueTickets$ = this.filterTickets(this.queueSource);
  filteredMyTickets$ = this.filterTickets(this.mySource);
  filteredAllTickets$ = this.filterTickets(this.allSource);

  private pages = {
    queue: new BehaviorSubject<number>(1),
    my: new BehaviorSubject<number>(1),
    all: new BehaviorSubject<number>(1),
  };

  hasNextQueue$ = new BehaviorSubject<boolean>(true);
  hasPrevQueue$ = new BehaviorSubject<boolean>(false);

  hasNextMy$ = new BehaviorSubject<boolean>(true);
  hasPrevMy$ = new BehaviorSubject<boolean>(false);

  hasNextAll$ = new BehaviorSubject<boolean>(true);
  hasPrevAll$ = new BehaviorSubject<boolean>(false);

  private pageSize = 10;

  constructor(
    private tickets: TicketsService,
    private notificationService: NotificationService
  ) {}

  private filterTickets(stream$: Observable<TicketSummaryDto[] | null>) {
    return combineLatest([
      stream$,
      this.statusFilter$,
      this.typeFilter$,
      this.priorityFilter$,
    ]).pipe(
      map(([source, statusFilter, typeFilter, priorityFilter]) => {
        if (!source) return null;
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

  private handlePagination(data: PaginationResponse<TicketSummaryDto>, tabKey: TicketTabKeys) {
    const hasNext = data.page * data.pageSize < data.totalCount;
    const hasPrev = data.page > 1;

    switch (tabKey) {
      case 'queue':
        this.hasNextQueue$.next(hasNext);
        this.hasPrevQueue$.next(hasPrev);
        break;
      case 'my':
        this.hasNextMy$.next(hasNext);
        this.hasPrevMy$.next(hasPrev);
        break;
      case 'all':
        this.hasNextAll$.next(hasNext);
        this.hasPrevAll$.next(hasPrev);
        break;
    }
  }

  loadTickets(tabKey: TicketTabKeys): void {
    const page = this.pages[tabKey].value;

    switch (tabKey) {
      case 'queue':
        this.tickets.getQueue(page, this.pageSize).subscribe({
          next: (data) => {
            this.queueSource.next(data.items);
            this.handlePagination(data, tabKey);
          },
          error: () => {
            this.notificationService.error('Failed to load queue');
          },
        });
        break;
      case 'my':
        this.tickets.getMy(page, this.pageSize).subscribe({
          next: (data) => {
            this.mySource.next(data.items);
            this.handlePagination(data, tabKey);
          },
          error: () => {
            this.notificationService.error('Failed to load tickets');
          },
        });
        break;
      case 'all':
        this.tickets.getAll(page, this.pageSize).subscribe({
          next: (data) => {
            this.allSource.next(data.items);
            this.handlePagination(data, tabKey);
          },
          error: () => {
            this.notificationService.error('Failed to load tickets');
          },
        });
        break;
    }
  }

  nextPage(tabKey: TicketTabKeys) {
    const hasNext =
      tabKey === 'queue'
        ? this.hasNextQueue$.value
        : tabKey === 'my'
          ? this.hasNextMy$.value
          : this.hasNextAll$.value;

    if (!hasNext) return;

    let page = this.pages[tabKey].value;
    this.pages[tabKey].next(++page);
    this.loadTickets(tabKey);
  }

  previousPage(tabKey: TicketTabKeys) {
    const hasPrev =
      tabKey === 'queue'
        ? this.hasPrevQueue$.value
        : tabKey === 'my'
          ? this.hasPrevMy$.value
          : this.hasPrevAll$.value;

    if (!hasPrev) return;

    let page = this.pages[tabKey].value;
    if (page > 1) {
      this.pages[tabKey].next(--page);
      this.loadTickets(tabKey);
    }
  }

  createTicket(req: CreateTicketRequest) {
    return this.tickets.create(req).pipe(tap(() => this.loadTickets('my')));
  }

  createDraft(req: CreateTicketRequest) {
    return this.tickets.createDraft(req).pipe(tap(() => this.loadTickets('my')));
  }

  publish(ticketId: string, req: CreateTicketRequest) {
    return this.tickets.publish(ticketId, req).pipe(tap(() => this.loadTickets('my')));
  }

  taketTicket(id: string) {
    return this.tickets.take(id).pipe(tap(() => this.loadTickets('queue')));
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
