import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../../../shared/services/tickets.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { UsersService } from '../../../../shared/services/users.service';
import { TeamsService } from '../../../../shared/services/teams.service';
import { ActivityLogService } from '../../../../shared/services/activity-log.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { decodeJwtPayload, extractRoleFromPayload, extractNamesFromPayload } from '../../../../shared/helpers/jwt.util';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgFor, NgIf, NgClass],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  tickets$!: Observable<any[]>;
  filteredTickets$!: Observable<any[]>;
  allTickets$!: Observable<any[]>;
  users$!: Observable<any[]>;
  teams$!: Observable<any[]>;
  logs$!: Observable<any[]>;
  stats$!: Observable<{open:number; inProgress:number; completed:number; cancelled:number; burning:number}>;
  loggingIn = false;
  error?: string;
  role: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  // Ticket details modal
  detailsOpen = false;
  detailsLoading = false;
  ticketDetails$?: Observable<any | null>;
  // Create ticket modal
  createOpen = false;
  createSubmitting = false;
  newTitle = '';
  newDescription = '';
  newDeadline = '';
  teamDetails$?: Observable<any | null>;
  // Filters
  private statusFilter$ = new BehaviorSubject<string>('all');
  private priorityFilter$ = new BehaviorSubject<string>('all');
  private typeFilter$ = new BehaviorSubject<string>('all');

  statusOptions = ['all','open','in progress','completed','cancelled'];
  priorityOptions = ['all','low','medium','high'];
  typeOptions = ['all','bug','design','translation','task'];

  constructor(
    private tickets: TicketsService,
    private auth: AuthService,
    private users: UsersService,
    private teams: TeamsService,
    private logs: ActivityLogService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('access_token') || '';
    const payload = token ? decodeJwtPayload(token) : undefined;
    const roleFromToken = (extractRoleFromPayload(payload) || '').toLowerCase();
    const nameFromToken = extractNamesFromPayload(payload);
    this.role = roleFromToken || (localStorage.getItem('user_role') || '').toLowerCase() || null;
    this.firstName = nameFromToken.firstName || localStorage.getItem('user_firstName');
    this.lastName = nameFromToken.lastName || localStorage.getItem('user_lastName');
    if (!this.firstName || !this.lastName) {
      this.users.me().subscribe({
        next: (u: any) => {
          this.firstName = u?.firstName || this.firstName;
          this.lastName = u?.lastName || this.lastName;
          if (this.firstName) localStorage.setItem('user_firstName', this.firstName);
          if (this.lastName) localStorage.setItem('user_lastName', this.lastName);
          const r = (u?.role || u?.userRole || u?.user?.role || '').toLowerCase();
          if (r) { this.role = r; localStorage.setItem('user_role', r); }
        },
        error: () => {}
      });
    }
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

    // Stats from all tickets (unfiltered)
    this.stats$ = this.tickets$.pipe(
      map(list => {
        const norm = (s: any) => String(s || '').toLowerCase();
        const now = Date.now();
        const acc = { open: 0, inProgress: 0, completed: 0, cancelled: 0, burning: 0 };
        for (const t of list) {
          const s = norm(t?.status);
          const deadline = t?.deadline ? new Date(t.deadline).getTime() : undefined;
          const isCompleted = s.startsWith('comp');
          const isCancelled = s.startsWith('canc');
          if (s.includes('progress')) acc.inProgress++;
          else if (isCompleted) acc.completed++;
          else if (isCancelled) acc.cancelled++;
          else acc.open++;
          // Burning Deadlines: deadline < 24h and status != Completed
          if (!isCompleted && typeof deadline === 'number') {
            const diffHrs = (deadline - now) / (1000 * 60 * 60);
            if (diffHrs > 0 && diffHrs < 24) acc.burning++;
          }
        }
        return acc;
      })
    );

    // Filtered tickets stream
    this.filteredTickets$ = combineLatest([
      this.tickets$,
      this.statusFilter$,
      this.priorityFilter$,
      this.typeFilter$,
    ]).pipe(
      map(([list, sF, pF, tF]) => {
        const norm = (v: any) => String(v || '').toLowerCase();
        return list.filter((t: any) => {
          const sOk = sF === 'all' || norm(t?.status).includes(sF);
          const pOk = pF === 'all' || norm(t?.priority) === pF;
          const tOk = tF === 'all' || norm(t?.type).includes(tF) || norm(t?.category).includes(tF);
          return sOk && pOk && tOk;
        });
      })
    );

    // Collections for tabs
    const arr = (res: any) => Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : (Array.isArray(res?.data) ? res.data : []));
    this.allTickets$ = this.tickets.getAll().pipe(map(arr));
    this.users$ = this.users.getAll().pipe(map(arr));
    this.teams$ = this.teams.getAll().pipe(map(arr));
    this.logs$ = this.logs.getLogs(1, 10).pipe(map(arr));
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

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_firstName');
    localStorage.removeItem('user_lastName');
    this.router.navigate(['/auth/login']);
  }

  openCreate() {
    this.createOpen = true;
    this.createSubmitting = false;
    this.newTitle = '';
    this.newDescription = '';
    this.newDeadline = '';
  }
  closeCreate() { this.createOpen = false; }
  submitCreate() {
    if (!this.newTitle || !this.newDeadline) { this.error = 'Title and deadline are required'; return; }
    this.createSubmitting = true;
    const isoDeadline = (() => { try { return new Date(this.newDeadline).toISOString(); } catch { return this.newDeadline; } })();
    const body = { title: this.newTitle, description: this.newDescription, deadline: isoDeadline } as any;
    this.tickets.create(body).subscribe({
      next: () => { this.createSubmitting = false; this.createOpen = false; this.refreshTickets(); },
      error: (e) => { this.createSubmitting = false; this.error = e?.message || 'Failed to create ticket'; }
    });
  }

  openTicket(t: any) {
    const id = t?.id || t?._id || t?.ticketId;
    if (!id) return;
    this.detailsOpen = true;
    this.detailsLoading = true;
    this.ticketDetails$ = this.tickets.getById(String(id)).pipe(
      map((res: any) => res || null)
    );
    // mark loading false when first value arrives
    this.ticketDetails$.subscribe({ complete: () => (this.detailsLoading = false), error: () => (this.detailsLoading = false) });
  }

  closeDetails() {
    this.detailsOpen = false;
    this.ticketDetails$ = undefined;
  }

  // Tabs
  activeTab: 'my' | 'all' | 'users' | 'teams' | 'logs' = 'my';
  setTab(tab: 'my' | 'all' | 'users' | 'teams' | 'logs') { this.activeTab = tab; }
  openTeam(t: any) {
    const id = t?.id || t?.teamId;
    if (!id) return;
    this.teamDetails$ = this.teams.getById(String(id)).pipe(map((res:any)=>res||null));
  }

  onStatusChange(value: string) { this.statusFilter$.next(value); }
  onPriorityChange(value: string) { this.priorityFilter$.next(value); }
  onTypeChange(value: string) { this.typeFilter$.next(value); }

  // Helpers for UI badges with graceful fallbacks
  statusClass(status: any) {
    const s = String(status || 'open').toLowerCase();
    return {
      badge: true,
      open: s.startsWith('open') || (!s || s === ''),
      progress: s.includes('progress'),
      completed: s.startsWith('comp'),
      cancelled: s.startsWith('canc')
    };
  }
  priorityClass(p: any) {
    const v = String(p || '').toLowerCase();
    return { pr: true, low: v==='low', medium: v==='medium', high: v==='high' };
  }
}
