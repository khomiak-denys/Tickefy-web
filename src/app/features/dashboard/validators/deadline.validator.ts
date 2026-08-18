import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDeadlineValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(control.value);

    if (deadline.getTime() < today.getTime()) {
      return { futureDeadline: true };
    }

    return null;
  };
}
