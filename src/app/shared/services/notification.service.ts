import { Injectable } from '@angular/core';
import { Notification } from '../helpers/dto/notification.dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _notificationsQueue: Notification[] = [];
  private _notifications: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  readonly notifications$ = this._notifications.asObservable();

  constructor() {}

  info(message: string) {
    this.createNotification(message, 'info');
  }

  error(message: string) {
    this.createNotification(message, 'error');
  }

  dismiss(id: string) {
    this.remove(id);
  }

  private createNotification(message: string, type: 'info' | 'error') {
    const notification: Notification = { id: crypto.randomUUID(), message, type };

    if (this._notifications.value.length < 3) {
      this._notifications.next([...this._notifications.value, notification]);
      this.activateNotification(notification);
    } else {
      this._notificationsQueue.push(notification);
    }
  }

  private remove(id: string) {
    const remaintNotifications = this._notifications.value.filter((n) => n.id !== id);

    if (this._notificationsQueue.length !== 0) {
      const pendingNotification = this._notificationsQueue.shift();
      this._notifications.next([...remaintNotifications, pendingNotification!]);
      this.activateNotification(pendingNotification!);
    } else {
      this._notifications.next(remaintNotifications);
    }
  }

  private activateNotification(notification: Notification) {
    setTimeout(() => {
      this.remove(notification.id);
    }, 5000);
  }
}
