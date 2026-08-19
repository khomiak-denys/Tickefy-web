import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthDto } from '../../../../core/api/dtos/auth.dto';
import { NotificationService } from '../../../../shared/services/notification.service';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { LoginUserRequest } from '../../../../core/api/dtos';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, FormErrorComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  loading = false;
  submitted = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  submit() {
    this.submitted = true;
    this.loading = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.loading = false;
      return;
    }

    const request = this.form.value as LoginUserRequest;

    this.auth.login(request).subscribe({
      next: (res: AuthDto) => {
        if (res.token) {
          this.auth.saveToken(res.token);
          this.auth.saveUserProfile(res.firstName, res.lastName);
          this.notificationService.info('Login successful');
          this.router.navigate(['/dashboard']);
        } else {
          this.notificationService.error('No token in response');
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
