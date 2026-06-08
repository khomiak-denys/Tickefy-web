import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TeamsService } from '../../../core/services/teams.service';
import { BehaviorSubject } from 'rxjs';
import { CreateTeamRequest, TeamSummary } from '../../../core/api/dtos';

@Injectable({
  providedIn: 'root',
})
export class DashboardTeamsService {
  teams$ = new BehaviorSubject<TeamSummary[]>([]);
  teamError$ = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthService,
    private teams: TeamsService
  ) {}

  loadTeams() {
    const role = this.auth.getRole();

    if (!role) {
      return;
    }

    if (role === 'admin') {
      this.teams.getAll().subscribe({
        next: (data) => {
          this.teams$.next(data);
        },
        error: (err) => {
          this.teamError$.next(err);
        },
      });
    } else {
      this.teams.getMy().subscribe({
        next: (data) => {
          this.teams$.next(data);
        },
        error: (err) => {
          this.teamError$.next(err);
        },
      });
    }
  }

  createTeam(req: CreateTeamRequest) {
    this.teams.create(req).subscribe({
      next: () => {
        this.loadTeams();
      },
      error: (e) => {
        this.teamError$.next(e?.error?.detail || 'Failed to create team');
      },
    });
  }
}
