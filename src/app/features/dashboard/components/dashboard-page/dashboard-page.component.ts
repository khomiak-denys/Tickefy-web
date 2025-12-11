import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../../../core/services/tickets.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UsersService } from '../../../../core/services/users.service';
import { TeamsService } from '../../../../core/services/teams.service';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { decodeJwtPayload, extractRoleFromPayload, extractNamesFromPayload } from '../../../../shared/helpers/jwt.util';
import { TicketDetailsDto, Category } from '../../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { IconsModule } from '../../../../shared/icons/icons.module';

type TabKey = 'my' | 'queue' | 'all' | 'users' | 'teams' | 'logs';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgFor, NgIf, NgClass, IconsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  tickets$!: Observable<any[]>;
  queueTickets$!: Observable<any[]>;
  myTickets$!: Observable<any[]>;
  filteredTickets$!: Observable<any[]>;
  filteredQueueTickets$!: Observable<any[]>;
  filteredMyTickets$!: Observable<any[]>;
  allTickets$!: Observable<any[]>;
  usersSource$ = new BehaviorSubject<any[]>([]);
  users$!: Observable<any[]>;
  filteredUsers$!: Observable<any[]>;
  teams$!: Observable<any[]>;
  logs$!: Observable<any[]>;
  logsPage$ = new BehaviorSubject<number>(1);
  logsPageSize = 10;
  hasPrevLogsPage = false;
  hasNextLogsPage = true;
  stats$!: Observable<{open:number; inProgress:number; completed:number; cancelled:number; burning:number}>;
  loggingIn = false;
  error?: string;
  role: string | null = null;
  currentUserId: string | null = null;
  isAdmin = false;
  isAgent = false;
  isRequester = false;
  isManager = false;
  allowedTabsList: TabKey[] = ['my', 'teams'];
  firstName: string | null = null;
  lastName: string | null = null;
  // Ticket details modal
  detailsOpen = false;
  detailsLoading = false;
  detailsError: string | null = null;
  selectedTicket: TicketDetailsDto | null = null;
  ticketDetails$?: Observable<TicketDetailsDto | null>;
  ticketActionLoading = false;
  ticketActionError: string | null = null;
  teamDetails$?: Observable<any>;
  teamDetailsOpen = false;
  teamDetailsLoading = false;
  selectedTeamId: string | null = null;
  newTeamMemberLogin = '';
  teamError: string | null = null;
  teamMembers: any[] = [];
  // Create team modal state
  createTeamOpen = false;
  createTeamSubmitting = false;
  createTeamError: string | null = null;
  newTeamName = '';
  newTeamDescription = '';
  newTeamCategory: number | null = null;
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
  userRoleOptions = ['Admin','Manager','Agent','Requester'];
  categoryOptions = [
    { value: Category.Finance, label: 'Finance' },
    { value: Category.IT, label: 'IT' },
    { value: Category.Design, label: 'Design' },
    { value: Category.Marketing, label: 'Marketing' },
    { value: Category.HumanResources, label: 'Human Resources' },
    { value: Category.Legal, label: 'Legal' },
    { value: Category.AccessAndSecurity, label: 'Access & Security' },
    { value: Category.Other, label: 'Other' },
  ];
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
    const idFromToken = (payload?.sub || payload?.userId || payload?.nameid || payload?._id || payload?.id || '').toString() || null;
    this.currentUserId = idFromToken;
    const nameFromToken = extractNamesFromPayload(payload);
    this.setRole(roleFromToken || (localStorage.getItem('user_role') || '').toLowerCase() || null);
    if (this.isAgent) this.activeTab = 'queue';
    this.firstName = nameFromToken.firstName || localStorage.getItem('user_firstName');
    this.lastName = nameFromToken.lastName || localStorage.getItem('user_lastName');
    if (!this.firstName || !this.lastName) {
      this.users.me().subscribe({
        next: (u: any) => {
          this.firstName = u?.firstName || this.firstName;
          this.lastName = u?.lastName || this.lastName;
          const uid = u?.id || u?._id || u?.userId;
          if (uid) this.currentUserId = String(uid);
          if (this.firstName) localStorage.setItem('user_firstName', this.firstName);
          if (this.lastName) localStorage.setItem('user_lastName', this.lastName);
          const r = (u?.role || u?.userRole || u?.user?.role || '').toLowerCase();
          if (r) {
            this.setRole(r);
            localStorage.setItem('user_role', r);
          }
        },
        error: () => {}
      });
    }
  }

  private refreshTeams() {
    const teamsSource$ = this.isAdmin ? this.teams.getAll() : this.teams.getMy();
    this.teams$ = teamsSource$.pipe(map((res: any) => this.normalizeList(res)));
  }

  private normalizeList(res: any) {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.data)) return res.data;
    if (res && typeof res === 'object') return [res];
    return [];
  }

  private refreshTickets() {
    const makeFiltered = (stream$: Observable<any[]>) => combineLatest([
      stream$,
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

    if (this.isAgent) {
      this.queueTickets$ = this.tickets.getQueue().pipe(map((res: any) => this.normalizeList(res)));
      this.myTickets$ = this.tickets.getMy().pipe(map((res: any) => this.normalizeList(res)));
      this.filteredQueueTickets$ = makeFiltered(this.queueTickets$);
      this.filteredMyTickets$ = makeFiltered(this.myTickets$);
      // Stats from queue
      this.stats$ = this.queueTickets$.pipe(
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
    } else {
      // Map possible API wrappers to a plain array
      this.tickets$ = this.tickets.getMy().pipe(map((res: any) => this.normalizeList(res)));

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
      this.filteredTickets$ = makeFiltered(this.tickets$);
    }

    // Collections for tabs
    this.allTickets$ = this.canViewTab('all')
      ? this.tickets.getAll().pipe(map((res: any) => this.normalizeList(res)))
      : of([]);
    this.users$ = this.usersSource$.asObservable();
    if (this.canViewTab('users')) {
      this.fetchUsers();
    } else {
      this.usersSource$.next([]);
    }
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
    this.refreshTeams();
    this.logs$ = this.logsPage$.pipe(
      switchMap((page: number) => this.logs.getLogs(page, this.logsPageSize)),
      map((res: any) => this.normalizeList(res)),
      tap((items: any[]) => {
        const page = this.logsPage$.value;
        this.hasPrevLogsPage = page > 1;
        // If current page returns 0 items, prevent advancing further
        this.hasNextLogsPage = items.length >= this.logsPageSize;
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

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_firstName');
    localStorage.removeItem('user_lastName');
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile() {
    this.router.navigate(['/settings/profile']);
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

  completeTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.complete(String(ticketId)).subscribe({
      next: () => { this.refreshTickets(); this.ticketDetails$ = this.tickets.getById(String(ticketId)); },
      error: (e) => { this.ticketActionLoading = false; this.ticketActionError = e?.status === 403 ? 'Forbidden: insufficient permissions' : 'Failed to complete ticket'; },
      complete: () => { this.ticketActionLoading = false; }
    });
  }

  reviseTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.revise(String(ticketId)).subscribe({
      next: () => { this.refreshTickets(); this.ticketDetails$ = this.tickets.getById(String(ticketId)); },
      error: (e) => { this.ticketActionLoading = false; this.ticketActionError = e?.status === 403 ? 'Forbidden: insufficient permissions' : 'Failed to revise ticket'; },
      complete: () => { this.ticketActionLoading = false; }
    });
  }

  cancelTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.cancel(String(ticketId)).subscribe({
      next: () => { this.refreshTickets(); this.ticketDetails$ = this.tickets.getById(String(ticketId)); },
      error: (e) => { this.ticketActionLoading = false; this.ticketActionError = e?.status === 403 ? 'Forbidden: insufficient permissions' : 'Failed to cancel ticket'; },
      complete: () => { this.ticketActionLoading = false; }
    });
  }

  takeTicket(ticketId: string | undefined) {
    if (!ticketId || this.ticketActionLoading) return;
    this.ticketActionLoading = true;
    this.ticketActionError = null;
    this.tickets.take(String(ticketId)).subscribe({
      next: () => { this.refreshTickets(); this.ticketDetails$ = this.tickets.getById(String(ticketId)); },
      error: (e) => { this.ticketActionLoading = false; this.ticketActionError = e?.status === 403 ? 'Forbidden: insufficient permissions' : 'Failed to take ticket'; },
      complete: () => { this.ticketActionLoading = false; }
    });
  }

  closeTicketError() { this.ticketActionError = null; }

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
  activeTab: TabKey = 'my';
  setTab(tab: TabKey) {
    const allowed = this.allowedTabsList.length ? this.allowedTabsList : this.computeAllowedTabs();
    if (!allowed.includes(tab)) {
      this.activeTab = allowed[0];
      return;
    }
    this.activeTab = tab;
  }
  openTeam(t: any) {
    const id = t?.id || t?.teamId;
    if (!id) return;
    this.selectedTeamId = String(id);
    this.teamDetailsOpen = true;
    this.teamDetailsLoading = true;
    this.fetchTeamDetails();
  }

  closeTeamDetails() {
    this.teamDetailsOpen = false;
    this.teamDetails$ = undefined;
    this.teamMembers = [];
  }

  addTeamMember() {
    const login = (this.newTeamMemberLogin || '').trim();
    if (!this.selectedTeamId || !login) return;

    this.teamDetailsLoading = true;
    
    // Ми відправляємо Login прямо в API додавання
    this.teams.addMemberByLogin(this.selectedTeamId!, login).subscribe({
      next: () => {
        this.newTeamMemberLogin = '';
        this.fetchTeamDetails();
        this.teamDetailsLoading = false;
      },
      error: (error: any) => {
        this.teamDetailsLoading = false;
        // Обробка помилок від бекенду
        if (error.status === 404) this.teamError = 'User not found';
        else if (error.status === 400) this.teamError = error?.error?.detail; // Наприклад "Only Requester users..."
        else this.teamError = 'Failed to add member';
      }
    });
  }

  removeTeamMember(member: any) {
    if (!this.selectedTeamId) return;
    const memberId = member?.id || member?._id || member?.userId;
    if (!memberId) return;
    this.teamDetailsLoading = true;
    this.teams.removeMember(this.selectedTeamId, String(memberId)).subscribe({
      next: () => this.fetchTeamDetails(),
      error: () => { this.teamDetailsLoading = false; }
    });
  }

  openCreateTeam() {
    this.createTeamOpen = true;
    this.createTeamSubmitting = false;
    this.createTeamError = null;
    this.newTeamName = '';
    this.newTeamDescription = '';
    this.newTeamCategory = null;
  }

  closeCreateTeam() {
    this.createTeamOpen = false;
  }

  submitCreateTeam() {
    const name = (this.newTeamName || '').trim();
    if (!name) { this.createTeamError = 'Team name is required'; return; }
    this.createTeamSubmitting = true;
    this.createTeamError = null;
    const payload: any = { name, description: this.newTeamDescription };
    if (this.newTeamCategory !== null) {
      payload.category = Number(this.newTeamCategory);
    }
    this.teams.create(payload).subscribe({
      next: () => {
        this.createTeamSubmitting = false;
        this.createTeamOpen = false;
        this.refreshTeams();
      },
      error: (e) => {
        this.createTeamSubmitting = false;
        this.createTeamError = e?.error?.detail || 'Failed to create team';
      }
    });
  }

  private fetchTeamDetails() {
    if (!this.selectedTeamId) return;
    this.teamError = null;
    this.teamDetails$ = this.teams.getById(this.selectedTeamId).pipe(map((res:any)=>res||null));
    this.teamDetails$.subscribe({
      next: (team) => {
        const list = Array.isArray(team?.members) ? team.members : [];
        const normalized = list
          .map((m: any) => {
            const u = m?.user || {};
            return {
              ...m,
              id: m?.id || m?._id || m?.userId || u?.id || u?._id,
              firstName: m?.firstName ?? u?.firstName ?? '',
              lastName: m?.lastName ?? u?.lastName ?? '',
              login: m?.login ?? m?.username ?? u?.login ?? u?.username ?? '',
              role: m?.role ?? u?.role ?? 'member'
            };
          })
          .filter((m: any) => m && (m.firstName || m.lastName || m.login));
        this.teamMembers = normalized;
      },
      complete: () => (this.teamDetailsLoading = false),
      error: () => { this.teamDetailsLoading = false; }
    });
  }

  viewUser(u: any) {
    const id = u?.id || u?._id || u?.userId;
    if (!id) return;
    this.router.navigate(['/settings/profile', String(id)]);
  }

  deleteUser(u: any) {
    const id = u?.id || u?._id || u?.userId;
    if (!id) return;
    this.users.delete(String(id)).subscribe({
      next: () => {
        this.fetchUsers();
      },
      error: () => {}
    });
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
  nextLogsPage() {
    if (!this.hasNextLogsPage) return;
    this.logsPage$.next(this.logsPage$.value + 1);
  }
  prevLogsPage() {
    if (!this.hasPrevLogsPage) return;
    const p = this.logsPage$.value - 1;
    this.logsPage$.next(p > 0 ? p : 1);
  }

  // TrackBy for stable list rendering
  trackById(index: number, item: any) {
    return item?.id || item?._id || index;
  }

  trackByUser(index: number, user: any) {
    return user?.id || user?._id || user?.userId || index;
  }

  membersList(team: any) {
    const list = Array.isArray(team?.members) ? team.members : [];
    return list.filter((m: any) => m && (m.firstName || m.lastName || m.login || m.username));
  }

  // Ticket ownership/helpers
  private normalizeId(entity: any): string | null {
    const id = entity?.id || entity?._id || entity?.userId;
    return id ? String(id) : null;
  }

  private ticketRequesterId(ticket: any): string | null {
    return this.normalizeId(ticket?.requester || ticket?.owner || ticket?.createdBy);
  }

  private ticketAssignedAgentId(ticket: any): string | null {
    return this.normalizeId(ticket?.assignedAgent || ticket?.agent || ticket?.assignee);
  }

  isTicketOwner(ticket: any) {
    const requesterId = this.ticketRequesterId(ticket);
    return requesterId && this.currentUserId ? requesterId === this.currentUserId : false;
  }

  isTicketAssignedToMe(ticket: any) {
    const assignedId = this.ticketAssignedAgentId(ticket);
    return assignedId && this.currentUserId ? assignedId === this.currentUserId : false;
  }

  canAgentTake(ticket: any) {
    return this.isAgent && !this.isTicketOwner(ticket) && !this.ticketAssignedAgentId(ticket);
  }

  canAgentComplete(ticket: any) {
    return (this.isAdmin || (this.isAgent && this.isTicketAssignedToMe(ticket))) && !this.isTicketOwner(ticket);
  }

  canAgentCancel(ticket: any) {
    return (this.isAdmin || (this.isAgent && this.isTicketAssignedToMe(ticket))) && !this.isTicketOwner(ticket);
  }

  private fetchUsers() {
    this.users
      .getAll()
      .pipe(map((res: any) => this.normalizeList(res)))
      .subscribe((list: any[]) => this.usersSource$.next(list));
  }

  private updateRoleFlags() {
    const r = (this.role || '').toLowerCase();
    this.isAdmin = r === 'admin';
    this.isAgent = r === 'agent';
    this.isRequester = r === 'requester';
    this.isManager = r === 'manager';
  }

  private setRole(role: string | null) {
    this.role = role ? role.toLowerCase() : null;
    this.updateRoleFlags();
    this.allowedTabsList = this.computeAllowedTabs();
    this.ensureActiveTabValid();
    this.refreshTickets();
  }

  private computeAllowedTabs(): TabKey[] {
    if (this.isAdmin) return ['all', 'teams', 'users', 'logs'];
    if (this.isManager) return ['my', 'teams'];
    if (this.isAgent) return ['queue', 'my', 'teams'];
    if (this.isRequester) return ['my', 'teams'];
    return ['my', 'teams'];
  }

  canViewTab(tab: TabKey) {
    return this.allowedTabsList.includes(tab);
  }

  private ensureActiveTabValid() {
    const allowed = this.allowedTabsList.length ? this.allowedTabsList : this.computeAllowedTabs();
    if (!allowed.includes(this.activeTab)) {
      this.activeTab = allowed[0];
    }
  }
}
