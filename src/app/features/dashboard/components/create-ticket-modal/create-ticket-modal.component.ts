import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CreateTicketRequest } from '../../../../core/api/dtos';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-create-ticket-modal',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './create-ticket-modal.component.html',
  styleUrl: './create-ticket-modal.component.scss',
})
export class CreateTicketModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateTicketRequest>();

  createSubmitting = false;
  newTitle = '';
  newDescription = '';
  newDeadline = '';
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'].currentValue === false) {
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

  submit() {
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

    this.submitted.emit(request);
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
}
