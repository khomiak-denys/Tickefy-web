import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, tap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserDto } from '../../../core/api/dtos';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PaginationResponse } from '../../../core/api/dtos/pagination-response.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardUserService {
  private usersSource$ = new BehaviorSubject<UserDto[]>([]);
  private userTeamFilter$ = new BehaviorSubject<string>('all');
  private userRoleFilter$ = new BehaviorSubject<string>('all');

  filteredUsers$ = this.filterUsers(this.usersSource$);

  page$ = new BehaviorSubject<number>(1);
  hasNextPage$ = new BehaviorSubject<boolean>(true);
  hasPrevPage$ = new BehaviorSubject<boolean>(false);
  private pageSize = 10;

  private _usersListCache: Observable<PaginationResponse<UserDto>> | null = null;

  constructor(
    private authService: AuthService,
    private usersRepository: UsersService,
    private notificationService: NotificationService
  ) {}

  private filterUsers(stream$: Observable<UserDto[]>) {
    return combineLatest([stream$, this.userRoleFilter$, this.userTeamFilter$]).pipe(
      map(([list, roleFilter, teamFilter]) => {
        const norm = (v: string | null | undefined) => String(v || '').toLowerCase();
        return list.filter((user: UserDto) => {
          const roleOk = roleFilter === 'all' || norm(user.role) === roleFilter;
          const teamOk = teamFilter === 'all' || norm(user.team?.name) === teamFilter;
          return roleOk && teamOk;
        });
      })
    );
  }

  loadUsers(force = false) {
    if (!this.authService.getRole()?.includes('admin')) {
      this.invalidateUsersListCache();
      return;
    }

    if (force) {
      this.invalidateUsersListCache();
    }

    if (!this._usersListCache) {
      this._usersListCache = this.usersRepository.getAll(this.page$.value, this.pageSize).pipe(
        tap({
          next: (data) => {
            this.usersSource$.next(data.items);
            this.hasNextPage$.next(data.page * data.pageSize < data.totalCount);
            this.hasPrevPage$.next(data.page > 1);
          },
          error: () => {
            this.notificationService.error('Failed to load users');
          },
        }),
        shareReplay(1)
      );
    }

    this._usersListCache.subscribe();
  }

  nextPage() {
    if (!this.hasNextPage$.value) return;
    let page = this.page$.value;
    this.page$.next(++page);
    this.loadUsers(true);
  }

  previousPage() {
    if (!this.hasPrevPage$.value) return;
    let page = this.page$.value;
    if (page > 1) {
      this.page$.next(--page);
      this.loadUsers(true);
    }
  }

  deleteUser(id: string) {
    if (!id) {
      return;
    }

    this.usersRepository.delete(String(id)).subscribe({
      next: () => {
        this.invalidateUsersListCache();
        this.loadUsers(true);
      },
      error: () => {
        this.notificationService.error('Failed to delete user');
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
