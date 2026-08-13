import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CreateTicketRequest } from '../../../../core/api/dtos';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  SplitButtonComponent,
  SplitBtnOption,
} from '../../../../shared/components/split-button/split-button.component';

@Component({
  selector: 'app-create-ticket-modal',
  imports: [FormsModule, LucideAngularModule, SplitButtonComponent],
  templateUrl: './create-ticket-modal.component.html',
  styleUrl: './create-ticket-modal.component.scss',
})
export class CreateTicketModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ request: CreateTicketRequest; action: string }>();

  createSubmitting = false;
  newTitle = '';
  newDescription = '';
  newDeadline = '';
  error: string | null = null;

  ticketSubmitOptions: SplitBtnOption[] = [
    {
      value: 'create',
      title: 'Create Ticket',
      description: 'Create a standard ticket.',
    },
    {
      value: 'draft',
      title: 'Create Draft',
      description: 'Create a draft ticket for later review.',
    },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === false) {
      this.newTitle = '';
      this.newDescription = '';
      this.newDeadline = '';
      this.createSubmitting = false;
      this.error = null;
    }
  }

  close() {
    this.closed.emit();
  }

  submit(actionValue: string) {
    if (!this.newTitle || !this.newDeadline) {
      this.error = 'Title and deadline are required';
      return;
    }

    const isoDeadline = this.formatDate(this.newDeadline);

    const request: CreateTicketRequest = {
      title: this.newTitle,
      description: this.newDescription,
      deadline: isoDeadline,
    };
    this.createSubmitting = true;

    this.submitted.emit({ request, action: actionValue });
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
}
