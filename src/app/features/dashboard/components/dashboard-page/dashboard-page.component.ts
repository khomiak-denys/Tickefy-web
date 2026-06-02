import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketsService } from '../../../../core/services/tickets.service';
import { UsersService } from '../../../../core/services/users.service';
import { TeamsService } from '../../../../core/services/teams.service';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { decodeJwtPayload } from '../../../../shared/helpers/jwt.util';
import {
  ActivityLogDto,
  Category, CreateTeamRequest, CreateTicketRequest,
  TeamDetails,
  TeamSummary,
  TicketSummaryDto,
  UserDto,
  UserShortDto
} from '../../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { IconsModule } from '../../../../shared/icons/icons.module';
import { TicketDetailsModalComponent } from '../ticket-details-modal/ticket-details-modal.component';
import { TicketsTabComponent } from '../tickets-tab/tickets-tab.component';
import { TeamsTabComponent } from '../teams-tab/teams-tab.component';
import { UsersTabComponent} from '../users-tab/users-tab.component';
import { LogsTabComponent} from '../logs-tab/logs-tab.component';

type TabKey = 'my' | 'queue' | 'all' | 'users' | 'teams' | 'logs';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [FormsModule, AsyncPipe, IconsModule, TicketDetailsModalComponent, TicketsTabComponent, TeamsTabComponent, UsersTabComponent, LogsTabComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  tickets$!: Observable<TicketSummaryDto[]>;
  queueTickets$!: Observable<TicketSummaryDto[]>;
  myTickets$!: Observable<TicketSummaryDto[]>;
  filteredTickets$!: Observable<TicketSummaryDto[]>;
  filteredQueueTickets$!: Observable<TicketSummaryDto[]>;
  filteredMyTickets$!: Observable<TicketSummaryDto[]>;
  allTickets$!: Observable<TicketSummaryDto[]>;
  usersSource$ = new BehaviorSubject<UserDto[]>([]);
  users$!: Observable<UserDto[]>;
  filteredUsers$!: Observable<UserDto[]>;
  teams$!: Observable<TeamSummary[]>;
  logs$!: Observable<ActivityLogDto[]>;
  logsPage$ = new BehaviorSubject<number>(1);
  logsPageSize = 10;
  hasPrevLogsPage = false;
  hasNextLogsPage = true;

  currentUserId: string | null = null;
  role: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;

  error: string | null = null;
  isAdmin = false;
  isAgent = false;
  isRequester = false;
  isManager = false;
  allowedTabsList: TabKey[] = ['my', 'teams'];

  isTicketModalOpen = false;
  selectedTicketId: string | null = null;

  teamDetails$: Observable<TeamDetails | null> = new Observable<TeamDetails>();
  teamDetailsOpen = false;
  teamDetailsLoading = false;
  selectedTeamId: string | null = null;
  newTeamMemberLogin = '';
  teamError: string | null = null;
  teamMembers: UserShortDto[] = [];

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

  statusFilter$ = new BehaviorSubject<string>('all');
  priorityFilter$ = new BehaviorSubject<string>('all');
  typeFilter$ = new BehaviorSubject<string>('all');

  userRoleFilter$ = new BehaviorSubject<string>('all');
  userTeamFilter$ = new BehaviorSubject<string>('all');

  constructor(
    private tickets: TicketsService,
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
    if (this.isAgent) {
      this.activeTab = 'queue';
    }
    this.firstName = localStorage.getItem('user_firstName');
    this.lastName = localStorage.getItem('user_lastName');

    if (!this.firstName || !this.lastName) {
      this.users.me().subscribe({
        next: (u: UserDto) => {
          this.firstName = u?.firstName || this.firstName;
          this.lastName = u?.lastName || this.lastName;
          if (u.id) {
            this.currentUserId = u.id;
          }

          if (this.firstName) {
            localStorage.setItem('user_firstName', this.firstName);
          }

          if (this.lastName) {
            localStorage.setItem('user_lastName', this.lastName);
          }

          const role = (u?.role || '').toLowerCase();
          if (role) {
            this.setRole(role);
            localStorage.setItem('user_role', role);
          }
        },
        error: () => {}
      });
    }
  }

  private refreshTeams() {
    this.teams$ = this.isAdmin ? this.teams.getAll() : this.teams.getMy();
  }

   refreshTickets() {
    const makeFiltered = (stream$: Observable<TicketSummaryDto[]>) => combineLatest([
      stream$,
      this.statusFilter$,
      this.priorityFilter$,
      this.typeFilter$,
    ]).pipe(
      map(([list, sF, pF, tF]) => {
        const norm = (v: string | null) => String(v || '').toLowerCase();
        return list.filter((t: TicketSummaryDto) => {
          const sOk = sF === 'all' || norm(t?.status).includes(sF);
          const pOk = pF === 'all' || norm(t?.priority) === pF;
          const tOk = tF === 'all' || norm(t?.category).includes(tF) || norm(t?.assignedTeam?.category).includes(tF);
          return sOk && pOk && tOk;
        });
      })
    );

    if (this.isAgent) {
      this.queueTickets$ = this.tickets.getQueue();
      this.myTickets$ = this.tickets.getMy();
      this.filteredQueueTickets$ = makeFiltered(this.queueTickets$);
      this.filteredMyTickets$ = makeFiltered(this.myTickets$);
    } else {
      this.tickets$ = this.tickets.getMy();
      this.filteredTickets$ = makeFiltered(this.tickets$);
    }

    this.allTickets$ = this.canViewTab('all')
      ? this.tickets.getAll()
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
        const norm = (v: string | null) => String(v || '').toLowerCase();
        return list.filter((u: UserDto) => {
          const rOk = rF === 'all' || norm(u?.role) === norm(rF);
          const tOk = tF === 'all' || norm(u?.team?.name) === norm(tF);
          return rOk && tOk;
        });
      })
    );
    this.refreshTeams();
    this.logs$ = this.logsPage$.pipe(
      switchMap((page: number) => this.logs.getLogs(page, this.logsPageSize)),
      tap((items: ActivityLogDto[]) => {
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

  closeCreate() {
    this.createTicketModalState.open = false;
  }

  submitCreate() {
    if (!this.createTicketModalState.newTitle || !this.createTicketModalState.newDeadline) { this.error = 'Title and deadline are required'; return; }
    this.createTicketModalState.createSubmitting = true;
    const isoDeadline = (() => { try { return new Date(this.createTicketModalState.newDeadline).toISOString(); } catch { return this.createTicketModalState.newDeadline; } })();
    const body = { title: this.createTicketModalState.newTitle, description: this.createTicketModalState.newDescription, deadline: isoDeadline } as CreateTicketRequest;
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
    this.teamDetails$ = new Observable<null>();
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
        if (error.status === 404) {
          this.teamError = 'User not found';
        }
        else if (error.status === 400) {
          this.teamError = error?.error?.detail;
        }
        else this.teamError = 'Failed to add member';
      }
    });
  }

  removeTeamMember(member: UserShortDto) {
    if (!this.selectedTeamId) {
      return;
    }

    if (!member.id) {
      return;
    }

    this.teamDetailsLoading = true;
    this.teams.removeMember(this.selectedTeamId, member.id).subscribe({
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
    const payload: CreateTeamRequest = { name, description: this.createTeamModalState.newTeamDescription, category: this.createTeamModalState.newTeamCategory };
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
    if (!this.selectedTeamId) {
      return;
    }
    this.teamError = null;
    this.teamDetails$ = this.teams.getById(this.selectedTeamId);
    this.teamDetails$.subscribe({
      next: (team) => {
        if (!team) {
          return;
        }

        const list = team.members;
        this.teamMembers = list
          .map((m: UserShortDto) => {
            return {
              id: m?.id,
              firstName: m?.firstName ?? '',
              lastName: m?.lastName ?? ''
            };
          })
          .filter((m: UserShortDto) => m && (m.firstName || m.lastName));
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

  private fetchUsers() {
    this.users
      .getAll()
      .subscribe((list: UserDto[]) => this.usersSource$.next(list));
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
