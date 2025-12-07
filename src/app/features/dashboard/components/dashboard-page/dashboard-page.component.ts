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
import { switchMap } from 'rxjs/operators';
import { decodeJwtPayload, extractRoleFromPayload, extractNamesFromPayload } from '../../../../shared/helpers/jwt.util';
import { TicketDetailsDto } from '../../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { IconsModule } from '../../../../shared/icons/icons.module';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgFor, NgIf, NgClass, IconsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  tickets$!: Observable<any[]>;
  filteredTickets$!: Observable<any[]>;
  allTickets$!: Observable<any[]>;
  users$!: Observable<any[]>;
  filteredUsers$!: Observable<any[]>;
  teams$!: Observable<any[]>;
  logs$!: Observable<any[]>;
  logsPage$ = new BehaviorSubject<number>(1);
  logsPageSize = 10;
  stats$!: Observable<{open:number; inProgress:number; completed:number; cancelled:number; burning:number}>;
  loggingIn = false;
  error?: string;
  role: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  // Ticket details modal
  detailsOpen = false;
  detailsLoading = false;
  detailsError: string | null = null;
  selectedTicket: TicketDetailsDto | null = null;
  ticketDetails$?: Observable<TicketDetailsDto | null>;
  teamDetails$?: Observable<any>;
  // New comment input state
  newCommentText = '';
  // Create ticket modal state
  createOpen = false;
  createSubmitting = false;
  newTitle = '';
  newDescription = '';
  newDeadline = '';
  typeOptions = ['all','bug','design','translation','task'];
  statusOptions = ['all','open','progress','completed','cancelled'];
  priorityOptions = ['all','low','medium','high'];
  // Filters
  statusFilter$ = new BehaviorSubject<string>('all');
  priorityFilter$ = new BehaviorSubject<string>('all');
  typeFilter$ = new BehaviorSubject<string>('all');
  // Users filters (optional, same pattern)
  userRoleFilter$ = new BehaviorSubject<string>('all');
  userTeamFilter$ = new BehaviorSubject<string>('all');

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

    // Filtered tickets stream (align with /tickets/my schema)
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
          const tOk = tF === 'all' || norm(t?.category).includes(tF) || norm(t?.assignedTeam?.category).includes(tF);
          return sOk && pOk && tOk;
        });
      })
    );

    // Collections for tabs
    const arr = (res: any) => Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : (Array.isArray(res?.data) ? res.data : []));
    this.allTickets$ = this.tickets.getAll().pipe(map(arr));
    this.users$ = this.users.getAll().pipe(map(arr));
        // Filtered users stream (align structure to tickets)
        this.filteredUsers$ = combineLatest([
          this.users$,
          this.userRoleFilter$,
          this.userTeamFilter$,
        ]).pipe(
          map(([list, rF, tF]) => {
            const norm = (v: any) => String(v || '').toLowerCase();
            return list.filter((u: any) => {
              const rOk = rF === 'all' || norm(u?.role) === norm(rF);
              const tOk = tF === 'all' || norm(u?.team?.name) === norm(tF);
              return rOk && tOk;
            });
          })
        );
    this.teams$ = this.teams.getAll().pipe(map(arr));
    this.logs$ = this.logsPage$.pipe(
      switchMap((page: number) => this.logs.getLogs(page, this.logsPageSize)),
      map(arr)
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

  addComment(ticketId: string | undefined, text: string | undefined) {
    const content = (text || '').trim();
    if (!ticketId || !content) return;
    // Optimistically clear input for UX
    this.newCommentText = '';
    // Post comment then refresh details stream
    this.tickets
      .postComment(String(ticketId), { content })
      .subscribe({
        next: () => {
          // Re-fetch details to include the new comment
          this.ticketDetails$ = this.tickets.getById(String(ticketId)).pipe(map((res:any)=>res||null));
        },
        error: () => {
          // If failed, restore text so user can retry
          this.newCommentText = content;
        }
      });
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
      completed: s.startsWith('comp') || s.includes('completed'),
      failed: s.includes('fail'),
      cancelled: s.startsWith('canc') || s.includes('cancel'),
      assigned: s.includes('assign'),
      created: s.includes('created')
    };
  }
  priorityClass(p: any) {
    const v = String(p || '').toLowerCase();
    return { pr: true, low: v==='low', medium: v==='medium', high: v==='high' };
  }

  roleClass(role: any) {
    const r = String(role || 'user').toLowerCase();
    return {
      admin: r === 'admin',
      requester: r === 'requester',
      manager: r === 'manager',
      agent: r === 'agent'
    };
  }

  // Activity log helpers
  logBadge(eventType: any) {
    const t = String(eventType || '').toLowerCase();
    return {
      badge: true,
      created: t.includes('requestcreated'),
      commented: t.includes('commentadded'),
      completed: t.includes('completed'),
      status: t.includes('statuschanged'),
      priority: t.includes('prioritychanged'),
      deadline: t.includes('deadlinechanged'),
      team: t.includes('teamassigned'),
      user: t.includes('userassigned'),
    };
  }
  logIcon(eventType: any) {
    const t = String(eventType || '').toLowerCase();
    if (t.includes('requestcreated')) return 'file-text';
    if (t.includes('commentadded')) return 'message-square';
    if (t.includes('completed')) return 'check-circle';
    if (t.includes('statuschanged')) return 'rotate-ccw';
    if (t.includes('prioritychanged')) return 'alert-circle';
    if (t.includes('deadlinechanged')) return 'calendar';
    if (t.includes('teamassigned')) return 'users';
    if (t.includes('userassigned')) return 'user';
    return 'file-text';
  }

  humanizeEvent(eventType: any) {
    const raw = String(eventType || '').trim();
    if (!raw) return '';
    const withSpaces = raw.replace(/([A-Z])/g, ' $1').trim();
    return withSpaces.toLowerCase();
  }

  // Logs pagination controls
  nextLogsPage() { this.logsPage$.next(this.logsPage$.value + 1); }
  prevLogsPage() { const p = this.logsPage$.value - 1; this.logsPage$.next(p > 0 ? p : 1); }

  // TrackBy for stable list rendering
  trackById(index: number, item: any) {
    return item?.id || item?._id || index;
  }
}
