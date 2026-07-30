import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { TicketSummaryDto } from '../../../../core/api/dtos';
import { LucideAngularModule } from 'lucide-angular';
import { AsyncPipe, DatePipe, NgClass, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-queue-tab',
  imports: [AsyncPipe, DatePipe, NgClass, LucideAngularModule, LowerCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queue-tab.component.html',
  styleUrl: './queue-tab.component.scss',
})
export class QueueTabComponent {
  @Input() filteredTickets$: Observable<TicketSummaryDto[] | null> = new Observable<
    TicketSummaryDto[] | null
  >();
  @Output() acceptedTicketId = new EventEmitter<string>();

  statusClass(status: string) {
    const s = String(status || 'open').toLowerCase();
    return {
      badge: true,
      open: s.startsWith('open') || !s || s === '',
      progress: s.includes('progress'),
      completed: s.startsWith('comp') || s.includes('completed'),
      failed: s.includes('fail'),
      cancelled: s.startsWith('canc') || s.includes('cancel'),
      assigned: s.includes('assign'),
      created: s.includes('created'),
    };
  }

  priorityClass(p: string) {
    const v = String(p || '').toLowerCase();
    return { pr: true, low: v === 'low', medium: v === 'medium', high: v === 'high' };
  }

  onAcceptClick(id: string) {
    this.acceptedTicketId.emit(id);
  }
}
