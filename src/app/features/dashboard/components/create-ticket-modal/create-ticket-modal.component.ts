import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CreateTicketRequest } from '../../../../core/api/dtos';
import { LucideAngularModule } from 'lucide-angular';
import {
  SplitButtonComponent,
  SplitBtnOption,
} from '../../../../shared/components/split-button/split-button.component';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell.component';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { futureDeadlineValidator } from '../../validators/deadline.validator';

@Component({
  selector: 'app-create-ticket-modal',
  imports: [
    LucideAngularModule,
    SplitButtonComponent,
    ModalShellComponent,
    ReactiveFormsModule,
    FormErrorComponent,
  ],
  templateUrl: './create-ticket-modal.component.html',
  styleUrl: './create-ticket-modal.component.scss',
})
export class CreateTicketModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ request: CreateTicketRequest; action: string }>();

  createSubmitting = false;

  form!: FormGroup;

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadline: ['', [Validators.required, futureDeadlineValidator()]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === false) {
      this.form.reset();
      this.createSubmitting = false;
    }
  }

  close() {
    this.closed.emit();
  }

  submit(actionValue: string) {
    this.updateDescriptionValidators(actionValue);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isoDeadline = this.formatDate(this.form.value.deadline);

    const request: CreateTicketRequest = {
      title: this.form.value.title,
      description: this.form.value.description,
      deadline: isoDeadline,
    };
    this.createSubmitting = true;

    this.submitted.emit({ request, action: actionValue });
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString();
  }

  private updateDescriptionValidators(actionValue: string) {
    const descriptionControl = this.form.get('description');

    if (actionValue === 'create') {
      descriptionControl?.setValidators([Validators.required]);
    } else {
      descriptionControl?.setValidators([]);
    }

    descriptionControl?.updateValueAndValidity();
  }
}
