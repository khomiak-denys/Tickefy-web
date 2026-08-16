import { FormControl } from '@angular/forms';
import { futureDeadlineValidator } from './deadline.validator';

describe('futureDeadlineValidator', () => {
  it('should return error if date is in the past', () => {
    const validator = futureDeadlineValidator();

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const control = new FormControl(pastDate);
    expect(validator(control)).toEqual({ futureDeadline: true });
  });

  it('should return null if date is in the future', () => {
    const validator = futureDeadlineValidator();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const control = new FormControl(futureDate);
    expect(validator(control)).toBeNull();
  });

  it('should return null if date is empty string', () => {
    const validator = futureDeadlineValidator();

    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });
});
