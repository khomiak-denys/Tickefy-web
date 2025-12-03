import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';

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

  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  submit() {
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
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'No token in response';
        }
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || e?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
