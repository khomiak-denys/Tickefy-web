import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivityLogService } from '../../../core/services/activity-log.service';
import { ActivityLogDto } from '../../../core/api/dtos';
import { NotificationService } from '../../../shared/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardLogsService {
  private page$ = new BehaviorSubject<number>(1);
  private logsPageSize = 10;
  logs$ = new BehaviorSubject<ActivityLogDto[]>([]);
  hasNextPage$ = new BehaviorSubject<boolean>(true);
  hasPreviousPage$ = new BehaviorSubject<boolean>(false);

  constructor(
    private logsRepository: ActivityLogService,
    private notificationService: NotificationService
  ) {}

  loadLogs() {
    this.logsRepository.getLogs(this.page$.value, this.logsPageSize).subscribe({
      next: (data) => {
        this.logs$.next(data);

        if (data.length < this.logsPageSize) {
          this.hasNextPage$.next(false);
        }

        if (this.page$.value <= 1) {
          this.hasPreviousPage$.next(false);
        }
      },
      error: () => {
        this.notificationService.error('Failed to load logs');
      },
    });
  }

  nextPage() {
    if (!this.hasNextPage$.value) {
      return;
    }

    let page = this.page$.value;
    this.page$.next(++page);
    this.hasPreviousPage$.next(true);

    this.loadLogs();
  }

  previousPage() {
    if (!this.hasPreviousPage$.value) {
      return;
    }

    if (this.page$.value <= 1) {
      return;
    }

    let page = this.page$.value;
    this.page$.next(--page);

    this.hasNextPage$.next(true);

    this.loadLogs();
  }
}
