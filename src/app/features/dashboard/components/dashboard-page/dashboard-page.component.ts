import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../../../../core/services/tickets.service';
import { UsersService } from '../../../../core/services/users.service';
import { TeamsService } from '../../../../core/services/teams.service';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import {
  ActivityLogDto,
  CreateTeamRequest,
  CreateTicketRequest,
  TeamSummary,
  TicketSummaryDto,
  UserDto,
} from '../../../../core/api/dtos';
import { map } from 'rxjs/operators';
import { IconsModule } from '../../../../shared/icons/icons.module';
import { TicketDetailsModalComponent } from '../ticket-details-modal/ticket-details-modal.component';
import { TicketsTabComponent } from '../tickets-tab/tickets-tab.component';
import { TeamsTabComponent } from '../teams-tab/teams-tab.component';
import { UsersTabComponent } from '../users-tab/users-tab.component';
import { LogsTabComponent } from '../logs-tab/logs-tab.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateTicketModalComponent } from '../create-ticket-modal/create-ticket-modal.component';
import { CreateTeamModalComponent } from '../create-team-modal/create-team-modal.component';
import { TeamDetailsModalComponent } from '../team-details-modal/team-details-modal.component';
import { DashboardTicketService } from '../../services/dashboard-ticket.service';

type TabKey = 'my' | 'queue' | 'all' | 'users' | 'teams' | 'logs';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    IconsModule,
    TicketDetailsModalComponent,
    TicketsTabComponent,
    TeamsTabComponent,
    UsersTabComponent,
    LogsTabComponent,
    CreateTicketModalComponent,
    CreateTeamModalComponent,
    TeamDetailsModalComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  filteredAllTickets$ = new Observable<TicketSummaryDto[]>();
  filteredMyTickets$ = new Observable<TicketSummaryDto[]>();
  filteredQueueTickets$ = new Observable<TicketSummaryDto[]>();

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

  isTeamDetailsOpen = false;
  selectedTeamId: string | null = null;

  isCreateTicketModalOpen = false;
  isCreateTeamModalOpen = false;

  userRoleFilter$ = new BehaviorSubject<string>('all');
  userTeamFilter$ = new BehaviorSubject<string>('all');

  constructor(
    private users: UsersService,
    private teams: TeamsService,
    private authService: AuthService,
    private logs: ActivityLogService,
    private router: Router,
    public ticketService: DashboardTicketService
  ) {
    this.filteredAllTickets$ = this.ticketService.filteredAllTickets$;
    this.filteredMyTickets$ = this.ticketService.filteredMyTickets$;
    this.filteredQueueTickets$ = this.ticketService.filteredQueueTickets$;
  }

  ngOnInit() {
    const payload = this.authService.getCurrentUser();
    const roleFromToken = this.authService.getRole();
    this.currentUserId = payload?.nameid ?? null;
    this.setRole(roleFromToken || null);

    if (this.isAgent) {
      this.activeTab = 'queue';
    }

    this.firstName = this.authService.getUserFirstName();
    this.lastName = this.authService.getUserLastName();

    if (!this.firstName || !this.lastName) {
      this.users.me().subscribe({
        next: (u: UserDto) => {
          if (u.id) {
            this.currentUserId = u.id;
          }

          this.authService.saveUserFromProfile(u);
          this.firstName = this.authService.getUserFirstName();
          this.lastName = this.authService.getUserLastName();

          this.setRole(roleFromToken);
        },
        error: () => {},
      });
    }

    this.ticketService.loadTickets();
  }

  private refreshTeams() {
    this.teams$ = this.isAdmin ? this.teams.getAll() : this.teams.getMy();
  }

  refreshUsers() {
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
  }

  refreshLogs() {
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
    this.authService.clearCurrentUser();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile() {
    this.router.navigate(['/settings/profile']);
  }

  openCreate() {
    this.isCreateTicketModalOpen = true;
  }

  closeTicketCreate() {
    this.isCreateTicketModalOpen = false;
  }

  refreshTickets() {
    this.ticketService.loadTickets();
  }

  createTicket(req: CreateTicketRequest) {
    this.ticketService.createTicket(req).subscribe({
      next: () => {
        this.isCreateTicketModalOpen = false;
        this.refreshTickets();
      },
      error: (error) => {
        this.error = error;
      },
    });
  }

  openTicket(id: string) {
    if (!id) {
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

    switch (tab) {
      case 'my':
      case 'queue':
      case 'all':
        this.refreshTickets();
        break;
      case 'users':
        this.refreshUsers();
        break;
      case 'logs':
        this.refreshLogs();
        break;
      case 'teams':
        this.refreshTeams();
        break;
    }
  }

  openTeam(id: string) {
    if (!id) {
      return;
    }
    this.selectedTeamId = String(id);
    this.isTeamDetailsOpen = true;
  }

  closeTeamDetails() {
    this.isTeamDetailsOpen = false;
  }

  openCreateTeamModal() {
    this.isCreateTeamModalOpen = true;
  }

  closeCreateTeamModal() {
    this.isCreateTeamModalOpen = false;
  }

  createTeam(req: CreateTeamRequest) {
    this.teams.create(req).subscribe({
      next: () => {
        this.isCreateTeamModalOpen = false;
        this.refreshTeams();
      },
      error: (e) => {
        this.error = e?.error?.detail || 'Failed to create team';
      },
    });
  }

  viewUser(id: string) {
    if (!id) {
      return;
    }

    this.router.navigate(['/settings/profile', String(id)]);
  }

  deleteUser(id: string) {
    if (!id) {
      return;
    }

    this.users.delete(String(id)).subscribe({
      next: () => {
        this.fetchUsers();
      },
      error: () => {},
    });
  }

  private fetchUsers() {
    this.users.getAll().subscribe((list: UserDto[]) => this.usersSource$.next(list));
  }

  private updateRoleFlags() {
    const r = (this.role || '').toLowerCase();
    this.isAdmin = r === 'admin';
    this.isAgent = r === 'agent';
    this.isRequester = r === 'requester';
    this.isManager = r === 'manager';
  }

  private setRole(role: string | null) {
    if (!role) {
      return;
    }

    this.role = role;
    this.updateRoleFlags();
    this.allowedTabsList = this.computeAllowedTabs();
    this.ensureActiveTabValid();

    this.setTab(this.activeTab);
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
