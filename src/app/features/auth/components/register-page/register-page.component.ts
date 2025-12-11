import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  loading = false;
  error?: string;
  form!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = undefined;
    const { firstName, lastName, login, password } = this.form.value as { firstName: string; lastName: string; login: string; password: string };
    this.auth.register({ firstName, lastName, login, password }).subscribe({
      next: () => {
        this.loading = false;
        // After successful registration, navigate to login
        this.router.navigate(['/auth/login']);
      },
      error: (e) => {
        // Handle ProblemDetails-like responses and various HTTP errors
        const body = e?.error;
        const status = e?.status;
        const title = body?.title || body?.error || undefined;
        const detail = body?.detail || body?.message || undefined;
        const errorsObj = body?.errors;

        let fieldErrors: string | undefined;
        if (errorsObj && typeof errorsObj === 'object') {
          const parts: string[] = [];
          Object.keys(errorsObj).forEach((key) => {
            const arr = errorsObj[key];
            if (Array.isArray(arr)) {
              parts.push(...arr);
            } else if (arr) {
              parts.push(String(arr));
            }
          });
          if (parts.length) fieldErrors = parts.join('\n');
        }

        const base = title || (status ? `HTTP ${status}` : 'Request failed');
        const msg = [base, detail, fieldErrors].filter(Boolean).join(': ');
        this.error = msg || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
