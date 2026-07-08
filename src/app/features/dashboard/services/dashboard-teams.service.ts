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

  private _teamsListCache: Observable<TeamSummary[]> | null = null;

  constructor(
    private auth: AuthService,
    private teams: TeamsService
  ) {}

  private _teamDetailsCache: Map<string, Observable<TeamDetails>> = new Map();

  loadTeams() {
    if (!this._teamsListCache) {
      const role = this.auth.getRole();

      if (!role) {
        return;
      }

      let request = role === 'admin' ? this.teams.getAll() : this.teams.getMy();

      this._teamsListCache = request.pipe(
        tap({
          next: (data) => {
            this.teams$.next(data);
          },
          error: (error) => {
            this.teamError$.next(error);
          }
        }),
        shareReplay(1),
      );
    }

    this._teamsListCache.subscribe();
  }

  createTeam(req: CreateTeamRequest) {
    return this.teams.create(req).pipe(tap(() => this.loadTeams()));
  }

  getById(id: string) {
    const observable = this._teamDetailsCache.get(id);

    if (!observable) {
      const request = this.teams.getById(id).pipe(shareReplay(1));
      this._teamDetailsCache.set(id, request);
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
    this._teamDetailsCache.delete(teamId);
  }
}
