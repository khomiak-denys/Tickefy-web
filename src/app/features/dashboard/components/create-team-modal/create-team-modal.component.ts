import { Component, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Category, CreateTeamRequest } from '../../../../core/api/dtos';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-team-modal',
  imports: [FormsModule],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.scss',
})
export class CreateTeamModalComponent implements OnChanges {
  @Input() open = false;
  @Output() closed = new EventEmitter();
  @Output() submitted = new EventEmitter<CreateTeamRequest>();

  newTeamName = '';
  newTeamDescription = '';
  newTeamCategory = '';
  error: string | null = null;
  createTeamSubmitting = false;

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
    if (changes['open'].currentValue === false) {
      this.newTeamName = '';
      this.newTeamDescription = '';
      this.newTeamCategory = '';
      this.error = null;
      this.createTeamSubmitting = false;
    }
  }

  close() {
    this.closed.emit();
  }

  submit() {
    if (!this.newTeamName || this.newTeamCategory === '') {
      this.error = 'The name and category is required';
      return;
    }

    const category = Number(this.newTeamCategory);

    const request: CreateTeamRequest = {
      name: this.newTeamName,
      description: this.newTeamDescription,
      category: category,
    };

    this.createTeamSubmitting = true;
    this.submitted.emit(request);
  }
}
