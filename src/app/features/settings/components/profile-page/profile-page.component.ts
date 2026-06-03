import {Component, OnDestroy} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {AsyncPipe, DatePipe} from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import {map, takeUntil} from 'rxjs/operators';
import {Observable, combineLatest, BehaviorSubject, Subject} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserDto } from '../../../../core/api/dtos';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, AsyncPipe, DatePipe],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  me$!: Observable<UserDto>;
  private userSubject = new BehaviorSubject<UserDto | null>(null);
  user$ = this.userSubject.asObservable();
  isOwner = false;
  isAdmin = false;
  canEdit = false;
  editing = false;
  firstName = '';
  lastName = '';
  userRoleOptions = ['Admin','Manager','Agent','Requester'];
  targetUserId: string | null = null;

  constructor(
    private users: UsersService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.targetUserId = this.route.snapshot.paramMap.get('id');
    this.me$ = this.users.me();
    this.loadUser();

    combineLatest([this.me$, this.user$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([me, user]) => {
      const meId = me.id;
      const userId = user?.id;
      const meRole = String(me?.role || '').toLowerCase();
      this.isOwner = !!meId && !!userId && meId === userId;
      this.isAdmin = meRole === 'admin';
      this.canEdit = this.isOwner || this.isAdmin;
      this.firstName = user?.firstName || '';
      this.lastName = user?.lastName || '';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startEdit() {
    if (this.canEdit) {
      this.editing = true;
    }
  }

  cancelEdit() { this.editing = false; }
  save() {
    if (!this.isOwner) {
      return;
    }

    const body = { firstName: this.firstName, lastName: this.lastName };
    this.users.updateProfile(body).subscribe({
      next: () => {
        this.authService.saveUserProfile(this.firstName, this.lastName);
        this.me$ = this.users.me();
        this.loadUser();
        this.editing = false;
      },
      error: () => {}
    });
  }

  goToMyTickets() {
    this.router.navigate(['/'], { queryParams: { tab: 'my' } });
  }

  changeRole(role: string) {
    if (!role) {
      return;
    }

    const user = this.userSubject.value;
    const id = this.targetUserId || user?.id;

    if (!id || !this.canEdit || !this.editing) {
      return;
    }

    if (this.isOwner && this.isAdmin){
      return;
    }

    const current = String(user?.role || '').toLowerCase();
    if (current === role.toLowerCase()) return;
    this.users.setRole(String(id), { role }).subscribe({
      next: () => {
        this.loadUser();
      },
      error: () => {}
    });
  }

  private loadUser() {
    const loader$ = this.targetUserId ? this.users.getById(this.targetUserId) : this.users.me();
    loader$.pipe(map(u => u)).subscribe(u => this.userSubject.next(u));
  }
}
