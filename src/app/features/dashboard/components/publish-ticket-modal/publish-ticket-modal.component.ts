import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CreateTicketRequest, TicketDetailsDto } from '../../../../core/api/dtos';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-publish-ticket-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './publish-ticket-modal.component.html',
  styleUrl: './publish-ticket-modal.component.scss',
})
export class PublishTicketModalComponent implements OnChanges {
  @Input() open = false;
  @Input() draftData: TicketDetailsDto | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() published = new EventEmitter<{ request: CreateTicketRequest }>();

  publishSubmitting = false;
  newTitle = '';
  newDescription = '';
  newDeadline = '';
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      if (this.draftData) {
        this.newTitle = this.draftData.title || '';
        this.newDescription = this.draftData.description || '';
        this.newDeadline = this.draftData.deadline ? this.draftData.deadline.substring(0, 10) : '';
      }
      this.publishSubmitting = false;
      this.error = null;
    } else if (changes['open']?.currentValue === false) {
      this.publishSubmitting = false;
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
    this.publishSubmitting = true;

    this.published.emit({ request });
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
}
