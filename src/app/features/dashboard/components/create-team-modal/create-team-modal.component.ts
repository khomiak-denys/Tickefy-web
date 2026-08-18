import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CreateTeamRequest } from '../../../../core/api/dtos';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell.component';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-create-team-modal',
  imports: [ReactiveFormsModule, ModalShellComponent, FormErrorComponent],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.scss',
})
export class CreateTeamModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Input() submitting = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateTeamRequest>();

  form = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    description: this.fb.control('', { nonNullable: true }),
    category: this.fb.control<Category | null>(null, { validators: [Validators.required] }),
  });

  categoryOptions = [
    { value: Category.Finance, label: 'Finance' },
    { value: Category.IT, label: 'IT' },
    { value: Category.Design, label: 'Design' },
    { value: Category.Marketing, label: 'Marketing' },
    { value: Category.HumanResources, label: 'Human Resources' },
    { value: Category.Legal, label: 'Legal' },
    { value: Category.AccessAndSecurity, label: 'Access & Security' },
    { value: Category.Other, label: 'Other' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === false) {
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

    const { name, description, category } = this.form.value;

    const request: CreateTeamRequest = {
      name: name!,
      description: description!,
      category: category as Category,
    };

    this.submitted.emit(request);
  }
}
