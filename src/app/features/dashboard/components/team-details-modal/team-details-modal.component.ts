import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TeamDetails, UserShortDto } from '../../../../core/api/dtos';
import { DashboardTeamsService } from '../../services/dashboard-teams.service';
import { ProblemDetails } from '../../../../core/api/dtos/error.dto';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-team-details-modal',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './team-details-modal.component.html',
  styleUrl: './team-details-modal.component.scss',
})
export class TeamDetailsModalComponent implements OnChanges {
  @Input() open = false;
  @Input() teamId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  teamDetails: TeamDetails | null = null;
  newTeamMemberLogin = '';
  teamDetailsLoading = false;

  constructor(
    private teamsService: DashboardTeamsService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((!changes['open'] || !changes['teamId']) && this.open && this.teamId) {
      return;
    }
    this.fetchTeamDetails();
  }

  close() {
    this.teamDetails = null;
    this.newTeamMemberLogin = '';
    this.teamDetailsLoading = false;
    this.closed.emit();
  }

  addTeamMember() {
    const login = (this.newTeamMemberLogin || '').trim();
    if (!this.teamId || !login) {
      return;
    }

    this.teamDetailsLoading = true;

    this.teamsService.addMemberByLogin(this.teamId!, login).subscribe({
      next: () => {
        this.newTeamMemberLogin = '';
        this.fetchTeamDetails();
        this.teamDetailsLoading = false;
        this.notificationService.info('Member added');
      },
      error: (error: ProblemDetails) => {
        this.teamDetailsLoading = false;
        if (error.status === 404) {
          this.notificationService.error('User not found');
        } else if (error.status === 400) {
          this.notificationService.error(
            error.errors?.['MemberLogin']?.[0] ?? 'Failed to add member'
          );
        } else {
          this.notificationService.error('Failed to add member');
        }
      },
    });
  }

  fetchTeamDetails() {
    if (!this.teamId) {
      return;
    }

    this.teamsService.getById(this.teamId).subscribe({
      next: (team) => {
        if (!team) {
          return;
        }

        if (team.id !== this.teamId) {
          return;
        }

        const list = team.members;
        team.members = list
          .map((m: UserShortDto) => {
            return {
              id: m?.id,
              firstName: m?.firstName ?? '',
              lastName: m?.lastName ?? '',
            };
          })
          .filter((m: UserShortDto) => m && (m.firstName || m.lastName));

        this.teamDetails = team;
      },
      complete: () => (this.teamDetailsLoading = false),
      error: () => {
        this.teamDetailsLoading = false;
      },
    });
  }

  removeTeamMember(member: UserShortDto) {
    if (!this.teamId) {
      return;
    }

    if (!member.id) {
      return;
    }

    this.teamDetailsLoading = true;
    this.teamsService.removeMember(this.teamId, member.id).subscribe({
      next: () => {
        this.fetchTeamDetails();
        this.notificationService.info('Member removed');
      },
      error: () => {
        this.teamDetailsLoading = false;
        this.notificationService.error('Failed to remove member');
      },
    });
  }
}
