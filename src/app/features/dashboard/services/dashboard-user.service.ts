import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, tap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserDto } from '../../../core/api/dtos';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardUserService {
  private usersSource$ = new BehaviorSubject<UserDto[]>([]);
  private userTeamFilter$ = new BehaviorSubject<string>('all');
  private userRoleFilter$ = new BehaviorSubject<string>('all');

  filteredUsers$ = this.filterUsers(this.usersSource$);
  private errors$ = new BehaviorSubject<string | null>(null);
  readonly userError$ = this.errors$.asObservable();

  private _usersListCache: Observable<UserDto[]> | null = null;

  constructor(
    private authService: AuthService,
    private usersRepository: UsersService
  ) {}

  private filterUsers(stream$: Observable<UserDto[]>) {
    return combineLatest([stream$, this.userRoleFilter$, this.userTeamFilter$]).pipe(
      map(([list, roleFilter, teamFilter]) => {
        const norm = (v: string | null) => String(v || '').toLowerCase();
        return list.filter((user: UserDto) => {
          const roleOk = roleFilter === 'all' || norm(user.role) === roleFilter;
          const teamOk = teamFilter === 'all' || norm(user.team?.name) === teamFilter;
          return roleOk && teamOk;
        });
      })
    );
  }

  loadUsers() {
    if (!this.authService.getRole()?.includes('admin')) {
      this.invalidateUsersListCache();
      return;
    }

    if (!this._usersListCache) {
      this._usersListCache = this.usersRepository.getAll().pipe(
        tap({
          next: (data) => {
            this.usersSource$.next(data);
          },
          error: (error) => {
            this.errors$.next(error);
          },
        }),
        shareReplay(1)
      );
    }

    this._usersListCache.subscribe();
  }

  deleteUser(id: string) {
    if (!id) {
      return;
    }

    this.errors$.next(null);
    this.usersRepository.delete(String(id)).subscribe({
      next: () => {
        this.invalidateUsersListCache();
        this.loadUsers();
      },
      error: (error) => {
        this.errors$.next(error);
      },
    });
  }

  getMe() {
    return this.usersRepository.me();
  }

  filterByTeamName(name: string): void {
    this.userTeamFilter$.next(name);
  }

  filterByRole(role: string): void {
    this.userRoleFilter$.next(role);
  }

  invalidateUsersListCache() {
    this._usersListCache = null;
  }
}
