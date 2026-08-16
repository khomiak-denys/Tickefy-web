import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrorComponent } from './form-error.component';
import { FormControl } from '@angular/forms';

describe('FormErrorComponent', () => {
  let component: FormErrorComponent;
  let fixture: ComponentFixture<FormErrorComponent>;
  let control: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorComponent],
    }).compileComponents();

    control = new FormControl();
    control.markAsTouched();

    fixture = TestBed.createComponent(FormErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show required error', () => {
    control.setErrors({ required: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('This field is required.');
  });

  it('should show minlength error', () => {
    control.setErrors({ minlength: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Value is too short.');
  });

  it('should show maxlength error', () => {
    control.setErrors({ maxlength: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Value is too long.');
  });

  it('should show pattern error', () => {
    control.setErrors({ pattern: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Value is invalid.');
  });

  it('should show email error', () => {
    control.setErrors({ email: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Value is invalid.');
  });

  it('should show min error', () => {
    control.setErrors({ min: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Value is too small.');
  });

  it('should show max error', () => {
    control.setErrors({ max: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Value is too large.');
  });

  it('should show futureDeadline error', () => {
    control.setErrors({ futureDeadline: true });
    component.control = control;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Deadline must be in the future.');
  });
});
