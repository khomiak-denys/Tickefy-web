import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TicketsService } from '../../../../shared/services/tickets.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-page',
  imports: [AsyncPipe, NgFor, NgIf],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  tickets$!: Observable<any[]>;
  loggingIn = false;
  error?: string;

  constructor(private tickets: TicketsService, private auth: AuthService) {}

  ngOnInit() {
    this.refreshTickets();
  }

  private refreshTickets() {
    // Map possible API wrappers to a plain array
    this.tickets$ = this.tickets.getMy().pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.items)) return res.items;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      })
    );
  }

  loginDemo() {
    this.loggingIn = true;
    this.error = undefined;
    this.auth
      .login({ login: 'admin', password: 'password' })
      .subscribe({
        next: (res: any) => {
          const token = res?.token || res?.accessToken || res;
          if (token) {
            localStorage.setItem('access_token', token);
            // refresh tickets stream to use authorized requests
            this.refreshTickets();
          } else {
            this.error = 'No token in response';
          }
          this.loggingIn = false;
        },
        error: (e) => {
          this.error = e?.message || 'Login failed';
          this.loggingIn = false;
        },
      });
  }
}
