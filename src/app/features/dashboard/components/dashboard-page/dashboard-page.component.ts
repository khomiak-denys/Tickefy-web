import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ActivityLogDto,
  CreateTeamRequest,
  CreateTicketRequest,
  TeamSummary,
  TicketSummaryDto,
  UserDto,
} from '../../../../core/api/dtos';
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
import { DashboardUserService } from '../../services/dashboard-user.service';
import { DashboardLogsService } from '../../services/dashboard-logs.service';
import { DashboardTeamsService } from '../../services/dashboard-teams.service';

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
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  filteredAllTickets$ = new Observable<TicketSummaryDto[]>();
  filteredMyTickets$ = new Observable<TicketSummaryDto[]>();
  filteredQueueTickets$ = new Observable<TicketSummaryDto[]>();

  filteredUsers$ = new Observable<UserDto[]>();
  logs$ = new Observable<ActivityLogDto[]>();

  hasNextPage = true;
  hasPreviousPage = false;

  teams$!: Observable<TeamSummary[]>;

  currentUserId: string | null = null;
  role: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;

  userError: string | null = null;
  ticketError: string | null = null;
  logError: string | null = null;
  teamError: string | null = null;

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

  constructor(
    private usersService: DashboardUserService,
    private ticketService: DashboardTicketService,
    private teamsService: DashboardTeamsService,
    private authService: AuthService,
    private logsService: DashboardLogsService,
    private router: Router
  ) {
    this.filteredAllTickets$ = this.ticketService.filteredAllTickets$;
    this.filteredMyTickets$ = this.ticketService.filteredMyTickets$;
    this.filteredQueueTickets$ = this.ticketService.filteredQueueTickets$;

    this.filteredUsers$ = this.usersService.filteredUsers$;

    this.logs$ = this.logsService.logs$;
    this.teams$ = this.teamsService.teams$;
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

    this.subscribeToErrors();
    this.ticketService.loadTickets();

    this.logsService.hasPreviousPage$.subscribe({
      next: (value) => {
        this.hasPreviousPage = value;
      }
    });

    this.logsService.hasNextPage$.subscribe({
      next: (value) => {
        this.hasNextPage = value;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshTeams() {
    this.teamsService.loadTeams();
  }

  private subscribeToErrors() {
    this.usersService.userError$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (error) => {
        this.userError = error;
      },
      error: (error) => {
        this.userError = error;
      },
    });

    this.ticketService.ticketError$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (error) => {
        this.ticketError = error;
      },
      error: (error) => {
        this.ticketError = error;
      },
    });

    this.logsService.logsError$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (error) => {
        this.logError = error;
      },
      error: (error) => {
        this.logError = error;
      },
    });

    this.teamsService.teamError$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (error) => {
        this.teamError = error;
      },
    });
  }

  private refreshUsers() {
    if (!this.canViewTab('users')) {
      return;
    }

    this.usersService.loadUsers();
  }

  private refreshLogs() {
    this.logsService.loadLogs();
  }

  nextLogsPage() {
    if (!this.hasNextPage) {
      return;
    }

    this.logsService.nextPage();
  }

  prevLogsPage() {
    if (!this.hasPreviousPage) {
      return;
    }

    this.logsService.previousPage();
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
      },
      error: (err) => {
        this.ticketError = err;
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
    this.teamsService.createTeam(req).subscribe({
      next: () => {
        this.isCreateTeamModalOpen = false;
      },
      error: (err) => {
        this.teamError = err;
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

    this.usersService.deleteUser(id);
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
