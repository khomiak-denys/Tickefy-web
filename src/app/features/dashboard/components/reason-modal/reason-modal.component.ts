import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalShellComponent } from '../../../../shared/components/modal-shell/modal-shell.component';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-reason-modal',
  imports: [ReactiveFormsModule, ModalShellComponent, FormErrorComponent],
  templateUrl: './reason-modal.component.html',
  styleUrl: './reason-modal.component.scss',
})
export class ReasonModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() open: boolean = false;
  @Input() submitting: boolean = false;
  @Input() actionName: string = '';
  @Output() submitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    reasonText: ['', Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === false) {
      this.reset();
    }
  }

  cancel(): void {
    this.cancelled.emit();
    this.reset();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.get('reasonText')?.value);
  }

  private reset(): void {
    this.form.reset();
  }
}
