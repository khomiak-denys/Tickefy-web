import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-reason-modal',
  imports: [FormsModule],
  templateUrl: './reason-modal.component.html',
  styleUrl: './reason-modal.component.scss',
})
export class ReasonModalComponent {
  @Input() open: boolean = false;
  @Input() actionName: string = '';
  @Output() submitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  error: string | null = null;
  reasonText: string = '';
  submitting: boolean = false;

  cancel(): void {
    this.cancelled.emit();
    this.reset();
  }

  submit(): void {
    if (!this.reasonText.trim()) {
      this.error = 'Reason is required';
      return;
    }
    this.submitted.emit(this.reasonText);
    this.reset();
  }

  private reset(): void {
    this.reasonText = '';
    this.error = null;
    this.submitting = false;
  }
}
