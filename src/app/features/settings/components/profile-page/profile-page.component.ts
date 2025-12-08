import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { UsersService } from '../../../../shared/services/users.service';
import { map } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgIf],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {
  me$!: Observable<any>;
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  isOwner = false;
  isAdmin = false;
  canEdit = false;
  editing = false;
  firstName = '';
  lastName = '';
  userRoleOptions = ['Admin','Manager','Agent','Requester'];
  targetUserId: string | null = null;

  constructor(private users: UsersService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.targetUserId = this.route.snapshot.paramMap.get('id');
    this.me$ = this.users.me();
    this.loadUser();

    combineLatest([this.me$, this.user$]).subscribe(([me, user]) => {
      const meId = me?.id || me?._id;
      const userId = user?.id || user?._id;
      const meRole = String(me?.role || '').toLowerCase();
      this.isOwner = !!meId && !!userId && meId === userId;
      this.isAdmin = meRole === 'admin';
      this.canEdit = this.isOwner || this.isAdmin;
      this.firstName = user?.firstName || '';
      this.lastName = user?.lastName || '';
    });
  }

  startEdit() { if (this.canEdit) this.editing = true; }
  cancelEdit() { this.editing = false; }
  save() {
    if (!this.isOwner) return;
    const body = { firstName: this.firstName, lastName: this.lastName };
    this.users.updateProfile(body).subscribe({
      next: () => {
        if (this.firstName) { localStorage.setItem('user_firstName', this.firstName); }
        if (this.lastName) { localStorage.setItem('user_lastName', this.lastName); }
        // refresh user streams so the view reflects latest data
        this.me$ = this.users.me();
        this.loadUser();
        this.editing = false;
      },
      error: () => { /* handle error */ }
    });
  }

  goToMyTickets() {
    this.router.navigate(['/'], { queryParams: { tab: 'my' } });
  }

  changeRole(role: string) {
    if (!role) return;
    const user = this.userSubject.value;
    const id = this.targetUserId || user?.id || user?._id;
    if (!id || !this.canEdit || !this.editing) return;
    if (this.isOwner && this.isAdmin) return; // admin cannot change own role
    const current = String(user?.role || '').toLowerCase();
    if (current === role.toLowerCase()) return;
    this.users.setRole(String(id), { role }).subscribe({
      next: () => {
        if (this.isOwner) localStorage.setItem('user_role', role.toLowerCase());
        this.loadUser();
      },
      error: () => { /* handle error */ }
    });
  }

  private loadUser() {
    const loader$ = this.targetUserId ? this.users.getById(this.targetUserId) : this.users.me();
    loader$.pipe(map(u => u)).subscribe(u => this.userSubject.next(u));
  }
}
