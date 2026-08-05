import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { NotificationToastComponent } from '../notification-toast/notification-toast.component';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Notification } from '../../helpers/dto/notification.dto';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-notification-host',
  imports: [NotificationToastComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-host.component.html',
  styleUrl: './notification-host.component.scss',
})
export class NotificationHostComponent {
  readonly notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  dismissNotification(id: string) {
    this.notificationService.dismiss(id);
  }
}
