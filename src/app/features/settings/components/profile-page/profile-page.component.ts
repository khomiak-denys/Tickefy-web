import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { UsersService } from '../../../../shared/services/users.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, NgIf],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {
  me$!: Observable<any>;
  user$!: Observable<any>;
  isOwner = false;
  editing = false;
  firstName = '';
  lastName = '';

  constructor(private users: UsersService, private router: Router) {}

  ngOnInit() {
    this.me$ = this.users.me();
    this.user$ = this.users.me().pipe(map(u => u));
    this.me$.subscribe(me => {
      this.user$.subscribe(user => {
        const meId = me?.id || me?._id;
        const userId = user?.id || user?._id;
        this.isOwner = !!meId && meId === userId;
        this.firstName = user?.firstName || '';
        this.lastName = user?.lastName || '';
      });
    });
  }

  startEdit() { if (this.isOwner) this.editing = true; }
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
        this.user$ = this.users.me().pipe(map(u => u));
        this.editing = false;
      },
      error: () => { /* handle error */ }
    });
  }

  goToMyTickets() {
    this.router.navigate(['/'], { queryParams: { tab: 'my' } });
  }
}
