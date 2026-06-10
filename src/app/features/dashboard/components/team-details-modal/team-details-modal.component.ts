import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { TeamDetails, UserShortDto } from '../../../../core/api/dtos';
import { TeamsService } from '../../../../core/services/teams.service';

@Component({
  selector: 'app-team-details-modal',
  imports: [AsyncPipe, FormsModule, LucideAngularModule],
  templateUrl: './team-details-modal.component.html',
  styleUrl: './team-details-modal.component.scss',
})
export class TeamDetailsModalComponent implements OnChanges {
  @Input() open = false;
  @Input() teamId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  teamDetails$: Observable<TeamDetails> | null = null;
  newTeamMemberLogin = '';
  teamDetailsLoading = false;
  error: string | null = null;
  teamMembers: UserShortDto[] = [];

  constructor(private teamsService: TeamsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((!changes['open'] || !changes['teamId']) && this.open && this.teamId) {
      return;
    }
    this.fetchTeamDetails();
  }

  close() {
    this.teamDetails$ = null;
    this.newTeamMemberLogin = '';
    this.teamMembers = [];
    this.teamDetailsLoading = false;
    this.error = null;
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
      },
      error: (error: any) => {
        this.teamDetailsLoading = false;
        if (error.status === 404) {
          this.error = 'User not found';
        } else if (error.status === 400) {
          this.error = error?.error?.detail;
        } else this.error = 'Failed to add member';
      },
    });
  }

  fetchTeamDetails() {
    if (!this.teamId) {
      return;
    }
    this.error = null;
    this.teamDetails$ = this.teamsService.getById(this.teamId);
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
              lastName: m?.lastName ?? '',
            };
          })
          .filter((m: UserShortDto) => m && (m.firstName || m.lastName));
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
      next: () => this.fetchTeamDetails(),
      error: () => {
        this.teamDetailsLoading = false;
      },
    });
  }
}
