import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, LowerCasePipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { UserDto } from '../../../../core/api/dtos';

@Component({
  selector: 'app-users-tab',
  imports: [LowerCasePipe, DatePipe, NgClass, AsyncPipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-tab.component.html',
  styleUrl: './users-tab.component.scss',
})
export class UsersTabComponent {
  @Input() filteredUsers$: Observable<UserDto[] | null> = new Observable<UserDto[] | null>();
  @Output() selectedUserId = new EventEmitter<string>();
  @Output() deletedUserId = new EventEmitter<string>();

  deleteUser(id: string) {
    this.deletedUserId.emit(id);
  }

  viewUser(id: string) {
    this.selectedUserId.emit(id);
  }

  roleClass(role: any) {
    const r = String(role || 'user').toLowerCase();
    return {
      admin: r === 'admin',
      requester: r === 'requester',
      manager: r === 'manager',
      agent: r === 'agent',
    };
  }
}
