import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
import { QueueTabComponent } from '../queue-tab/queue-tab.component';
import { TeamsTabComponent } from '../teams-tab/teams-tab.component';
import { UsersTabComponent } from '../users-tab/users-tab.component';
import { LogsTabComponent } from '../logs-tab/logs-tab.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateTicketModalComponent } from '../create-ticket-modal/create-ticket-modal.component';
import { CreateTeamModalComponent } from '../create-team-modal/create-team-modal.component';
import { TeamDetailsModalComponent } from '../team-details-modal/team-details-modal.component';
import { DashboardTicketService, TicketTabKeys } from '../../services/dashboard-ticket.service';
import { DashboardUserService } from '../../services/dashboard-user.service';
import { DashboardLogsService } from '../../services/dashboard-logs.service';
import { DashboardTeamsService } from '../../services/dashboard-teams.service';
import { AsyncPipe } from '@angular/common';
import { NotificationService } from '../../../../shared/services/notification.service';

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
    AsyncPipe,
    QueueTabComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  filteredAllTickets$ = new Observable<TicketSummaryDto[]>();
  filteredMyTickets$ = new Observable<TicketSummaryDto[]>();
  filteredQueueTickets$ = new Observable<TicketSummaryDto[]>();

  activeTab: TabKey = 'my';

  filteredUsers$ = new Observable<UserDto[]>();
  logs$ = new Observable<ActivityLogDto[]>();

  hasNextPage = true;
  hasPreviousPage = false;

  teams$!: Observable<TeamSummary[]>;

  currentUserId: string | null = null;
  role: string | null = null;
  firstName$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  lastName$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

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
    private router: Router,
    private notificationService: NotificationService
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

    this.setRole(roleFromToken);

    if (this.isAgent) {
      this.activeTab = 'queue';
    } else if (this.isAdmin) {
      this.activeTab = 'all';
    } else {
      this.activeTab = 'my';
    }

    this.setTab(this.activeTab);

    this.firstName$ = this.authService.firstName$;
    this.lastName$ = this.authService.lastName$;

    this.subscribeToLogsPagination();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshTeams() {
    this.teamsService.loadTeams();
  }

  private subscribeToLogsPagination() {
    this.logsService.hasPreviousPage$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (value) => {
        this.hasPreviousPage = value;
      },
    });

    this.logsService.hasNextPage$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (value) => {
        this.hasNextPage = value;
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
    this.authService.logout().subscribe();
    this.authService.clearCurrentUser();
    this.teamsService.invalidateTeamsListCache();
    this.usersService.invalidateUsersListCache();
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

  refreshTickets(tabKey: TabKey) {
    if (this.isTicketTabKey(tabKey)) {
      this.ticketService.loadTickets(tabKey);
    }
  }

  isTicketTabKey(tabKey: TabKey): tabKey is TicketTabKeys {
    return tabKey === 'my' || tabKey === 'queue' || tabKey === 'all';
  }

  createTicket(req: CreateTicketRequest) {
    this.ticketService.createTicket(req).subscribe({
      next: () => {
        this.isCreateTicketModalOpen = false;
        this.notificationService.info('Ticket created successfully');
      },
      error: () => {
        this.notificationService.error('Failed to create ticket');
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

  takeTicket(id: string) {
    this.ticketService.taketTicket(id).subscribe({
      next: () => {
        this.notificationService.info('Ticket taken successfully');
      },
      error: () => {
        this.notificationService.error('Failed to take ticket');
      },
    });
  }

  closeTicketModal() {
    this.isTicketModalOpen = false;
    this.selectedTicketId = null;
  }

  setTab(tab: TabKey) {
    const allowed = this.allowedTabsList.length ? this.allowedTabsList : this.computeAllowedTabs();
    if (!allowed.includes(tab)) {
      this.activeTab = allowed[0];
      return;
    }

    this.activeTab = tab;
    this.loadDataForTab(this.activeTab);
  }

  loadDataForTab(tab: TabKey) {
    switch (tab) {
      case 'my':
      case 'queue':
      case 'all':
        this.refreshTickets(tab);
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
        this.notificationService.info('Team created successfully');
      },
      error: () => {
        this.notificationService.error('Failed to create team');
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
}
