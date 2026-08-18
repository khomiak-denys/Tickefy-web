import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CreateTicketRequest, TicketDetailsDto } from '../../../../core/api/dtos';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { futureDeadlineValidator } from '../../validators/deadline.validator';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-publish-ticket-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, FormErrorComponent],
  templateUrl: './publish-ticket-modal.component.html',
  styleUrl: './publish-ticket-modal.component.scss',
})
export class PublishTicketModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Input() submitting = false;
  @Input() draftData: TicketDetailsDto | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ request: CreateTicketRequest }>();

  form = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: Validators.required }),
    description: this.fb.control('', { nonNullable: true, validators: Validators.required }),
    deadline: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, futureDeadlineValidator()],
    }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      if (this.draftData) {
        this.form.patchValue({
          title: this.draftData.title || '',
          description: this.draftData.description || '',
          deadline: this.draftData.deadline
            ? new Date(this.draftData.deadline).toISOString().substring(0, 10)
            : '',
        });
      }
    } else if (changes['open']?.currentValue === false) {
      this.form.reset();
    }
  }

  close() {
    this.closed.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isoDeadline = new Date(this.form.value.deadline!).toISOString();

    const request: CreateTicketRequest = {
      title: this.form.value.title!,
      description: this.form.value.description!,
      deadline: isoDeadline,
    };

    this.submitted.emit({ request });
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }
}
