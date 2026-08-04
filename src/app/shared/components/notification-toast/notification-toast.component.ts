import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Notification } from '../../helpers/dto/notification.dto';

@Component({
  selector: 'app-notification-toast',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss',
})
export class NotificationToastComponent {
  @Input() notification!: Notification;
  @Output() notificationDismissed = new EventEmitter<string>();

  dismissNotification() {
    this.notificationDismissed.emit(this.notification.id);
  }
}
