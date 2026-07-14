import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivityLogService } from '../../../core/services/activity-log.service';
import { ActivityLogDto } from '../../../core/api/dtos';

@Injectable({
  providedIn: 'root',
})
export class DashboardLogsService {
  private page$ = new BehaviorSubject<number>(1);
  private logsPageSize = 10;
  private errors$ = new BehaviorSubject<string | null>(null);
  readonly logsError$ = this.errors$.asObservable();

  logs$ = new BehaviorSubject<ActivityLogDto[]>([]);
  hasNextPage$ = new BehaviorSubject<boolean>(true);
  hasPreviousPage$ = new BehaviorSubject<boolean>(false);

  constructor(private logsRepository: ActivityLogService) {
    this.page$.subscribe({
      next: () => {},
      error: (error) => {
        this.errors$.next(error);
      },
    });
  }

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
      error: (err) => {
        this.errors$.next(err);
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
