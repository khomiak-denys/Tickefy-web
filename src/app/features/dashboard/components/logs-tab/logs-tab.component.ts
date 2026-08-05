import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { ActivityLogDto } from '../../../../core/api/dtos';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-logs-tab',
  imports: [AsyncPipe, DatePipe, LucideAngularModule, NgClass, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logs-tab.component.html',
  styleUrl: './logs-tab.component.scss',
})
export class LogsTabComponent {
  @Input() logs$: Observable<ActivityLogDto[] | null> = new Observable<ActivityLogDto[]>();
  @Input() hasPrevPage = false;
  @Input() hasNextPage = true;

  @Output() nextPage = new EventEmitter<void>();
  @Output() prevPage = new EventEmitter<void>();

  nextLogsPage() {
    this.nextPage.emit();
  }

  prevLogsPage() {
    this.prevPage.emit();
  }

  humanizeEvent(eventType: string) {
    const raw = String(eventType || '').trim();
    if (!raw) return '';
    const withSpaces = raw.replace(/([A-Z])/g, ' $1').trim();
    return withSpaces.toLowerCase();
  }

  logBadge(eventType: string) {
    const t = String(eventType || '').toLowerCase();
    return {
      badge: true,
      created: t.includes('requestcreated'),
      commented: t.includes('commentadded'),
      completed: t.includes('completed'),
      status: t.includes('statuschanged'),
      priority: t.includes('prioritychanged'),
      deadline: t.includes('deadlinechanged'),
      team: t.includes('teamassigned'),
      user: t.includes('userassigned'),
    };
  }

  logIcon(eventType: string) {
    const t = String(eventType || '').toLowerCase();
    if (t.includes('requestcreated')) return 'file-text';
    if (t.includes('commentadded')) return 'message-square';
    if (t.includes('completed')) return 'check-circle';
    if (t.includes('statuschanged')) return 'rotate-ccw';
    if (t.includes('prioritychanged')) return 'alert-circle';
    if (t.includes('deadlinechanged')) return 'calendar';
    if (t.includes('teamassigned')) return 'users';
    if (t.includes('userassigned')) return 'user';
    return 'file-text';
  }
}
