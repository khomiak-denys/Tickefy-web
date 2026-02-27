import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { decodeJwtPayload } from '../../../../shared/helpers/jwt.util';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  loading = false;
  error?: string;
  submitted = false;

  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = undefined;
    const { login, password } = this.form.value as { login: string; password: string };
    this.auth.login({ login, password }).subscribe({
      next: (res: any) => {
        const token = res?.token || res?.accessToken || res;
        if (token) {
          localStorage.setItem('access_token', token);
          const payload = decodeJwtPayload(token);
          const roleFromToken = payload?.role;
          if (roleFromToken) localStorage.setItem('user_role', roleFromToken);
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'No token in response';
        }
        this.loading = false;
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

        // Compose a user-friendly message
        const base = title || (status ? `HTTP ${status}` : 'Request failed');
        const msg = [base, detail, fieldErrors].filter(Boolean).join(': ');
        this.error = msg || 'Login failed';
        this.loading = false;
      }
    });
  }
}
