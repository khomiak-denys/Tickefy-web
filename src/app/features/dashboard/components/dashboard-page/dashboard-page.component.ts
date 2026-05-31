import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
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
import { decodeJwtPayload } from '../../../../shared/helpers/jwt.util';
import { Category } from '../../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { IconsModule } from '../../../../shared/icons/icons.module';
import { TicketDetailsModalComponent } from '../ticket-details-modal/ticket-details-modal.component';
import { TicketsTabComponent } from '../tickets-tab/tickets-tab.component';
import { TeamsTabComponent } from '../teams-tab/teams-tab.component';
import { UsersTabComponent} from '../users-tab/users-tab.component';
import {LogsTabComponent} from '../logs-tab/logs-tab.component';

type TabKey = 'my' | 'queue' | 'all' | 'users' | 'teams' | 'logs';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [FormsModule, AsyncPipe, IconsModule, TicketDetailsModalComponent, TicketsTabComponent, TeamsTabComponent, UsersTabComponent, LogsTabComponent],
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

  currentUserId: string | null = null;
  loggingIn = false;
  role: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;

  error?: string;
  isAdmin = false;
  isAgent = false;
  isRequester = false;
  isManager = false;
  allowedTabsList: TabKey[] = ['my', 'teams'];

  isTicketModalOpen = false;
  selectedTicketId: string | null = null;

  teamDetails$?: Observable<any>;
  teamDetailsOpen = false;
  teamDetailsLoading = false;
  selectedTeamId: string | null = null;
  newTeamMemberLogin = '';
  teamError: string | null = null;
  teamMembers: any[] = [];

  createTeamModalState = {
    createTeamOpen: false,
    createTeamSubmitting: false,
    createTeamError: "",
    newTeamName: '',
    newTeamDescription: '',
    newTeamCategory: 0
  };

  createTicketModalState = {
    open: false,
    createSubmitting: false,
    newTitle: '',
    newDescription: '',
    newDeadline: ''
  }

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
    const payload = token ? decodeJwtPayload(token) : null;
    const roleFromToken = payload?.role?.toLowerCase();
    this.currentUserId = payload?.nameid ?? null;
    this.setRole(roleFromToken || (localStorage.getItem('user_role') || '').toLowerCase() || null);
    if (this.isAgent) this.activeTab = 'queue';
    this.firstName = localStorage.getItem('user_firstName');
    this.lastName = localStorage.getItem('user_lastName');
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

   refreshTickets() {
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

          if (!isCompleted && typeof deadline === 'number') {
            const diffHrs = (deadline - now) / (1000 * 60 * 60);
            if (diffHrs > 0 && diffHrs < 24) acc.burning++;
          }
        }
        return acc;
      })
      );
    } else {
      this.tickets$ = this.tickets.getMy().pipe(map((res: any) => this.normalizeList(res)));

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

            if (!isCompleted && typeof deadline === 'number') {
              const diffHrs = (deadline - now) / (1000 * 60 * 60);
              if (diffHrs > 0 && diffHrs < 24) acc.burning++;
            }
          }
          return acc;
        })
      );

      this.filteredTickets$ = makeFiltered(this.tickets$);
    }

    this.allTickets$ = this.canViewTab('all')
      ? this.tickets.getAll().pipe(map((res: any) => this.normalizeList(res)))
      : of([]);
    this.users$ = this.usersSource$.asObservable();
    if (this.canViewTab('users')) {
      this.fetchUsers();
    } else {
      this.usersSource$.next([]);
    }

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
        this.hasNextLogsPage = items.length >= this.logsPageSize;
      })
    );
  }

  nextLogsPage() {
    if (!this.hasNextLogsPage) return;
    this.logsPage$.next(this.logsPage$.value + 1);
  }
  prevLogsPage() {
    if (!this.hasPrevLogsPage) return;
    const p = this.logsPage$.value - 1;
    this.logsPage$.next(p > 0 ? p : 1);
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
    this.createTicketModalState.open = true;
    this.createTicketModalState.createSubmitting = false;
    this.createTicketModalState.newTitle = '';
    this.createTicketModalState.newDescription = '';
    this.createTicketModalState.newDeadline = '';
  }
  closeCreate() { this.createTicketModalState.open = false; }
  submitCreate() {
    if (!this.createTicketModalState.newTitle || !this.createTicketModalState.newDeadline) { this.error = 'Title and deadline are required'; return; }
    this.createTicketModalState.createSubmitting = true;
    const isoDeadline = (() => { try { return new Date(this.createTicketModalState.newDeadline).toISOString(); } catch { return this.createTicketModalState.newDeadline; } })();
    const body = { title: this.createTicketModalState.newTitle, description: this.createTicketModalState.newDescription, deadline: isoDeadline } as any;
    this.tickets.create(body).subscribe({
      next: () => { this.createTicketModalState.createSubmitting = false; this.createTicketModalState.open = false; this.refreshTickets(); },
      error: (e) => { this.createTicketModalState.createSubmitting = false; this.error = e?.message || 'Failed to create ticket'; }
    });
  }

  openTicket(id: string) {
    if (!id){
      return;
    }

    this.isTicketModalOpen = true;
    this.selectedTicketId = String(id);
  }

  closeTicketModal() {
    this.isTicketModalOpen = false;
    this.selectedTicketId = null;
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
  openTeam(id: string) {
    if (!id) {
      return;
    }
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

    this.teams.addMemberByLogin(this.selectedTeamId!, login).subscribe({
      next: () => {
        this.newTeamMemberLogin = '';
        this.fetchTeamDetails();
        this.teamDetailsLoading = false;
      },
      error: (error: any) => {
        this.teamDetailsLoading = false;
        if (error.status === 404) this.teamError = 'User not found';
        else if (error.status === 400) this.teamError = error?.error?.detail;
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
    this.createTeamModalState.createTeamOpen = true;
    this.createTeamModalState.createTeamSubmitting = false;
    this.createTeamModalState.createTeamError = '';
    this.createTeamModalState.newTeamName = '';
    this.createTeamModalState.newTeamDescription = '';
    this.createTeamModalState.newTeamCategory = -1;
  }

  closeCreateTeam() {
    this.createTeamModalState.createTeamOpen = false;
  }

  submitCreateTeam() {
    const name = (this.createTeamModalState.newTeamName || '').trim();
    if (!name) { this.createTeamModalState.createTeamError = 'Team name is required'; return; }
    this.createTeamModalState.createTeamSubmitting = true;
    this.createTeamModalState.createTeamError = '';
    const payload: any = { name, description: this.createTeamModalState.newTeamDescription };
    if (this.createTeamModalState.newTeamCategory !== null) {
      payload.category = Number(this.createTeamModalState.newTeamCategory);
    }
    this.teams.create(payload).subscribe({
      next: () => {
        this.createTeamModalState.createTeamSubmitting = false;
        this.createTeamModalState.createTeamOpen = false;
        this.refreshTeams();
      },
      error: (e) => {
        this.createTeamModalState.createTeamSubmitting = false;
        this.createTeamModalState.createTeamError = e?.error?.detail || 'Failed to create team';
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

  viewUser(id: string) {
    if (!id)
    {
      return;
    }

    this.router.navigate(['/settings/profile', String(id)]);
  }

  deleteUser(id: string) {
    if (!id)
    {
      return;
    }

    this.users.delete(String(id)).subscribe({
      next: () => {
        this.fetchUsers();
      },
      error: () => {}
    });
  }

  trackByUser(index: number, user: any) {
    return user?.id || user?._id || user?.userId || index;
  }
  // Ticket ownership/helpers
  private normalizeId(entity: any): string | null {
    const id = entity?.id || entity?._id || entity?.userId;
    return id ? String(id) : null;
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
