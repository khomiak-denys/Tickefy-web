import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {TicketDetailsDto} from '../../../../core/api/dtos';
import {catchError, Observable, of} from 'rxjs';
import { IconsModule } from '../../../../shared/icons/icons.module';
  import {AsyncPipe, DatePipe, NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TicketsService} from '../../../../core/services/tickets.service';

@Component({
  selector: 'app-ticket-details-modal',
  standalone: true,
  imports: [
    IconsModule,
    NgClass,
    DatePipe,
    FormsModule,
    AsyncPipe
  ],
  templateUrl: './ticket-details-modal.component.html',
  styleUrl: './ticket-details-modal.component.scss'
})
export class TicketDetailsModalComponent implements OnChanges {
  ticketDetails$?: Observable<TicketDetailsDto | null>;
  @Input() open = false;
  @Input() ticketId: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  ticketActionLoading = false;
  newCommentText = '';
  ticketActionError: string | null = null;

  constructor(
    private tickets: TicketsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
        if((changes['ticketId'] || changes['open']) && this.open && this.ticketId) {
          this.loadDetails(this.ticketId);
        }
    }

    loadDetails(ticketId: string): void {
      this.ticketDetails$ = this.tickets.getById(ticketId).pipe(catchError(() => of(null)));
    }


  closeDetails() {
    this.closed.emit();
  }
  addComment(ticketId: string | undefined, text: string | undefined) {
    const content = (text || '').trim();
    if (!ticketId || !content) return;
    // Optimistically clear input for UX
    this.newCommentText = '';
    // Post comment then refresh details stream
    this.tickets.postComment(String(ticketId), { content }).subscribe({
      next: () => {
        this.newCommentText = '';
        this.loadDetails(ticketId);
        this.updated.emit();
      },
      error: () => {
        this.newCommentText = '';
        this.ticketActionError = 'Failed to add comment';
      },
      complete: () => {
        this.newCommentText = '';
      }
    })

  }

  completeTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.complete(String(ticketId)).subscribe({
      next: () => {
        this.loadDetails(ticketId);
        this.updated.emit();
      },
      error: () => this.ticketActionError = 'Failed to take ticket',
      complete: () => this.ticketActionLoading = false
    });
  }

  reviseTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.revise(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => this.ticketActionError = 'Failed to take ticket',
      complete: () => this.ticketActionLoading = false
    })
  }

  cancelTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.cancel(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => this.ticketActionError = 'Failed to take ticket',
      complete: () => this.ticketActionLoading = false
    })
  }

  takeTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.take(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => this.ticketActionError = 'Failed to take ticket',
      complete: () => this.ticketActionLoading = false
    })
  }

  canTake(ticket: TicketDetailsDto) {
    return ticket.availableActions?.some(a => a.key === "Take") ?? false;
  }

  canComplete(ticket: TicketDetailsDto) {
    return ticket.availableActions?.some(a => a.key === "Complete") ?? false;
  }

  canCancel(ticket: TicketDetailsDto) {
    return ticket.availableActions?.some(a => a.key === "Cancel") ?? false;
  }

  statusClass(status: any) {
    const s = String(status || 'open').toLowerCase();
    return {
      badge: true,
      open: s.startsWith('open') || (!s || s === ''),
      progress: s.includes('progress'),
      completed: s.startsWith('comp') || s.includes('completed'),
      failed: s.includes('fail'),
      cancelled: s.startsWith('canc') || s.includes('cancel'),
      assigned: s.includes('assign'),
      created: s.includes('created')
    };
  }
}
