import { Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserDto } from '../../../../core/api/dtos';

function min2Symbols(control: AbstractControl): ValidationErrors | null {
  const firstName: string = control.value;
  const regex = /^[a-zA-Z]+$/;
  const matches = regex.exec(firstName);
  return firstName.length < 2 || !matches ? { invalidName: true } : null;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
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
  submitted = false;
  userRoleOptions = ['Admin', 'Manager', 'Agent', 'Requester'];
  targetUserId: string | null = null;

  form!: FormGroup;

  constructor(
    private users: UsersService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      firstName: [{ value: '', disabled: true }, [Validators.required, min2Symbols]],
      lastName: [{ value: '', disabled: true }, [Validators.required, min2Symbols]],
    });
  }

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

        this.form.patchValue({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startEdit() {
    if (!this.canEdit) {
      return;
    }

    this.editing = true;
    this.form.get('firstName')?.enable();
    this.form.get('lastName')?.enable();
  }

  cancelEdit() {
    this.editing = false;
    this.submitted = false;
    this.form.get('firstName')?.disable();
    this.form.get('lastName')?.disable();

    this.form.reset({
      firstName: this.userSubject.value?.firstName || '',
      lastName: this.userSubject.value?.lastName || '',
    });
  }

  save() {
    this.submitted = true;

    if (!this.isOwner) {
      return;
    }

    if (this.form.invalid) {
      return;
    }

    const { firstName, lastName } = this.form.getRawValue() as {
      firstName: string;
      lastName: string;
    };
    this.users.updateProfile({ firstName, lastName }).subscribe({
      next: () => {
        this.authService.saveUserProfile(firstName, lastName);
        this.me$ = this.users.me();
        this.loadUser();
        this.editing = false;
        this.submitted = false;
        console.log(this.submitted);
        this.form.get('firstName')?.disable();
        this.form.get('lastName')?.disable();
      },
      error: () => {},
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

    if (this.isOwner && this.isAdmin) {
      return;
    }

    const current = String(user?.role || '').toLowerCase();
    if (current === role.toLowerCase()) return;
    this.users.setRole(String(id), { role }).subscribe({
      next: () => {
        this.loadUser();
      },
      error: () => {},
    });
  }

  private loadUser() {
    const loader$ = this.targetUserId ? this.users.getById(this.targetUserId) : this.users.me();
    loader$.pipe(map((u) => u)).subscribe((u) => this.userSubject.next(u));
  }
}
