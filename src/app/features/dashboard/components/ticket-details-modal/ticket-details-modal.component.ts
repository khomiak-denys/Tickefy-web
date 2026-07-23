import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TicketDetailsDto } from '../../../../core/api/dtos';
import { catchError, Observable, of } from 'rxjs';
import { IconsModule } from '../../../../shared/icons/icons.module';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../../../core/services/tickets.service';
import { ReasonModalComponent } from '../reason-modal/reason-modal.component';

@Component({
  selector: 'app-ticket-details-modal',
  standalone: true,
  imports: [IconsModule, NgClass, DatePipe, FormsModule, AsyncPipe, ReasonModalComponent],
  templateUrl: './ticket-details-modal.component.html',
  styleUrl: './ticket-details-modal.component.scss',
})
export class TicketDetailsModalComponent implements OnChanges {
  ticketDetails$: Observable<TicketDetailsDto | null> = new Observable<TicketDetailsDto>();
  @Input() open = false;
  @Input() ticketId: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  ticketActionLoading = false;
  newCommentText = '';
  ticketActionError: string | null = null;
  pendingAction: ActionConfig | null = null;

  reasonModalOpened: boolean = false;
  reasonActionName: string = '';

  ticketActions: Record<string, ActionConfig> = {
    Take: {
      label: 'Take',
      icon: 'plus-circle',
      style: 'primary',
      handler: this.takeTicket.bind(this),
      requireReason: false,
    },
    Reopen: {
      label: 'Reopen',
      icon: 'refresh-ccw',
      style: 'warning',
      handler: this.reopenTicket.bind(this),
      requireReason: true,
    },
    Complete: {
      label: 'Complete',
      icon: 'check-circle',
      style: 'primary',
      handler: this.completeTicket.bind(this),
      requireReason: false,
    },
    Cancel: {
      label: 'Cancel',
      icon: 'x-circle',
      style: 'danger',
      handler: this.cancelTicket.bind(this),
      requireReason: true,
    },
    Fail: {
      label: 'Fail',
      icon: 'x-circle',
      style: 'danger',
      handler: this.failTicket.bind(this),
      requireReason: true,
    },
    Accept: {
      label: 'Accept',
      icon: 'check',
      style: 'primary',
      handler: this.acceptTicket.bind(this),
      requireReason: false,
    },
    StartWork: {
      label: 'Start work',
      icon: 'play-circle',
      style: 'primary',
      handler: this.startWorkTicket.bind(this),
      requireReason: false,
    },
  };

  constructor(private tickets: TicketsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['ticketId'] || changes['open']) && this.open && this.ticketId) {
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
      },
    });
  }

  statusClass(status: string) {
    const s = String(status || 'open').toLowerCase();
    return {
      badge: true,
      open: s.startsWith('open') || !s || s === '',
      progress: s.includes('progress'),
      completed: s.startsWith('comp') || s.includes('completed'),
      failed: s.includes('fail'),
      cancelled: s.startsWith('canc') || s.includes('cancel'),
      assigned: s.includes('assign'),
      created: s.includes('created'),
    };
  }

  completeTicket(ticketId: string | null) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.complete(String(ticketId)).subscribe({
      next: () => {
        this.loadDetails(ticketId);
        this.updated.emit();
      },
      error: () => (this.ticketActionError = 'Failed to take ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  reopenTicket(ticketId: string) {
    if (this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.reopen(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => (this.ticketActionError = 'Failed to take ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  cancelTicket(ticketId: string | null, reason: string | null) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    if (!reason) {
      this.ticketActionError = 'Please provide a reason';
      return;
    }

    this.setLoadingModalState();
    this.tickets.cancel(ticketId, reason).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => (this.ticketActionError = 'Failed to take ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  takeTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.take(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => (this.ticketActionError = 'Failed to take ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  failTicket(ticketId: string | null, reason: string | null) {
    if (!ticketId || !reason) {
      this.ticketActionError = 'Please provide a reason';
      return;
    }

    if (this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.fail(ticketId, reason).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => (this.ticketActionError = 'Failed to take ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  acceptTicket(ticketId: string) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.accept(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => (this.ticketActionError = 'Failed to aceept ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  startWorkTicket(ticketId: string) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.startWork(ticketId).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
      },
      error: () => (this.ticketActionError = 'Failed to start work on ticket'),
      complete: () => (this.ticketActionLoading = false),
    });
  }

  onActionClick(action: ActionConfig) {
    this.pendingAction = action;

    if (action.requireReason) {
      this.openReasonModal(action.label);
    } else {
      this.executeAction(null);
    }
  }

  openReasonModal(actionName: string) {
    this.reasonActionName = actionName;
    this.reasonModalOpened = true;
  }

  onReasonModalClose(reason: string | null) {
    this.reasonModalOpened = false;
    if (this.pendingAction) {
      this.executeAction(reason);
    }
  }

  private executeAction(reason: string | null) {
    if (!this.pendingAction || !this.ticketId) {
      return;
    }

    this.pendingAction.handler(this.ticketId, reason);
    this.pendingAction = null;
  }

  private setLoadingModalState() {
    this.ticketActionLoading = true;
    this.ticketActionError = null;
  }
}

interface ActionConfig {
  label: string;
  icon: string;
  style: string;
  requireReason: boolean;
  handler: (ticketId: string, reason: string | null) => void;
}
