import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TeamsService } from '../../../core/services/teams.service';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { CreateTeamRequest, TeamDetails, TeamSummary } from '../../../core/api/dtos';
import { shareReplay } from 'rxjs/operators';

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

  private _cache: Map<string, Observable<TeamDetails>> = new Map();

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
    return this.teams.create(req).pipe(tap(() => this.loadTeams()));
  }

  getById(id: string) {
    const observable = this._cache.get(id);

    if (!observable) {
      const request = this.teams.getById(id).pipe(shareReplay(1));
      this._cache.set(id, request);
      return request;
    }

    return observable;
  }

  addMemberByLogin(teamId: string, login: string) {
    return this.teams
      .addMemberByLogin(teamId, login)
      .pipe(tap(() => this.invalidateTeamDetails(teamId)));
  }

  removeMember(teamId: string, memberId: string) {
    return this.teams
      .removeMember(teamId, memberId)
      .pipe(tap(() => this.invalidateTeamDetails(teamId)));
  }

  private invalidateTeamDetails(teamId: string) {
    this._cache.delete(teamId);
  }
}
