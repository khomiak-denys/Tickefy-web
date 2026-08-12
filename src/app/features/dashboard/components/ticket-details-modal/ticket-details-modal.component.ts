import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TicketDetailsDto } from '../../../../core/api/dtos';
import { catchError, Observable, of } from 'rxjs';
import { IconsModule } from '../../../../shared/icons/icons.module';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../../../core/services/tickets.service';
import { ReasonModalComponent } from '../reason-modal/reason-modal.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell.component';

@Component({
  selector: 'app-ticket-details-modal',
  standalone: true,
  imports: [
    IconsModule,
    NgClass,
    DatePipe,
    FormsModule,
    AsyncPipe,
    ReasonModalComponent,
    SkeletonComponent,
    ModalShellComponent,
  ],
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
  private pendingAction: ActionConfig | null = null;

  reasonModalOpened: boolean = false;
  reasonActionName: string = '';

  ticketActions: Record<string, ActionConfig> = {
    Take: {
      label: 'Take',
      icon: 'plus-circle',
      style: 'primary',
      handler: this.takeTicket.bind(this),
    },
    Reopen: {
      label: 'Reopen',
      icon: 'refresh-ccw',
      style: 'warning',
      handler: this.reopenTicket.bind(this),
    },
    Complete: {
      label: 'Complete',
      icon: 'check-circle',
      style: 'success',
      handler: this.completeTicket.bind(this),
    },
    Cancel: {
      label: 'Cancel',
      icon: 'x-circle',
      style: 'danger',
      handler: this.cancelTicket.bind(this),
    },
    Fail: {
      label: 'Fail',
      icon: 'x-circle',
      style: 'danger',
      handler: this.failTicket.bind(this),
    },
    Accept: {
      label: 'Accept',
      icon: 'check',
      style: 'success',
      handler: this.acceptTicket.bind(this),
    },
    StartWork: {
      label: 'Start work',
      icon: 'play-circle',
      style: 'primary',
      handler: this.startWorkTicket.bind(this),
    },
  };

  getActionConfig(key: string): ActionConfig | null {
    if (this.ticketActions[key]) {
      return this.ticketActions[key];
    }
    const foundKey = Object.keys(this.ticketActions).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    return foundKey ? this.ticketActions[foundKey] : null;
  }

  constructor(
    private tickets: TicketsService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['ticketId'] || changes['open']) && this.open && this.ticketId) {
      this.loadDetails(this.ticketId);
    }
  }

  private loadDetails(ticketId: string): void {
    this.ticketDetails$ = this.tickets.getById(ticketId).pipe(catchError(() => of(null)));
  }

  closeDetails() {
    this.closed.emit();
  }

  addComment(ticketId: string, text: string | undefined) {
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
        this.notificationService.error('Failed to add comment');
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

  private completeTicket(ticketId: string) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.complete(String(ticketId)).subscribe({
      next: () => {
        this.loadDetails(ticketId);
        this.updated.emit();
        this.notificationService.info('Ticket completed');
      },
      error: () => {
        this.notificationService.error('Failed to complete ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  private reopenTicket(ticketId: string, reason: string | null) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    if (!reason) {
      this.notificationService.error('Please provide a reason');
      return;
    }

    this.setLoadingModalState();
    this.tickets.reopen(String(ticketId), reason).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
        this.notificationService.info('Ticket reopened');
      },
      error: () => {
        this.notificationService.error('Failed to reopen ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  private cancelTicket(ticketId: string | null, reason: string | null) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    if (!reason) {
      this.notificationService.error('Please provide a reason');
      return;
    }

    this.setLoadingModalState();
    this.tickets.cancel(ticketId, reason).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
        this.notificationService.info('Ticket cancelled');
      },
      error: () => {
        this.notificationService.error('Failed to cancel ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  private takeTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.take(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
        this.notificationService.info('Ticket taken');
      },
      error: () => {
        this.notificationService.error('Failed to take ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  private failTicket(ticketId: string, reason: string | null) {
    if (!ticketId || !reason) {
      this.notificationService.error('Please provide a reason');
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
        this.notificationService.info('Ticket marked as failed');
      },
      error: () => {
        this.notificationService.error('Failed to fail ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  private acceptTicket(ticketId: string) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.accept(String(ticketId)).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
        this.notificationService.info('Ticket accepted');
      },
      error: () => {
        this.notificationService.error('Failed to accept ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  private startWorkTicket(ticketId: string) {
    if (!ticketId || this.ticketActionLoading) {
      return;
    }

    this.setLoadingModalState();
    this.tickets.startWork(ticketId).subscribe({
      next: () => {
        this.updated.emit();
        this.loadDetails(ticketId);
        this.notificationService.info('Work started on ticket');
      },
      error: () => {
        this.notificationService.error('Failed to start work on ticket');
      },
      complete: () => (this.ticketActionLoading = false),
    });
  }

  onActionClick(requireReason: boolean, action: ActionConfig) {
    this.pendingAction = action;

    if (requireReason) {
      this.openReasonModal(action.label);
    } else {
      this.executeAction(null);
    }
  }

  openReasonModal(actionName: string) {
    this.reasonActionName = actionName;
    this.reasonModalOpened = true;
  }

  onReasonModalSubmit(reason: string | null) {
    this.reasonModalOpened = false;
    if (this.pendingAction) {
      this.executeAction(reason);
    }
  }

  onReasonModalClose() {
    this.reasonModalOpened = false;
    this.pendingAction = null;
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
  }
}

interface ActionConfig {
  label: string;
  icon: string;
  style: string;
  handler: (ticketId: string, reason: string | null) => void;
}
