import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, LowerCasePipe, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { TicketSummaryDto } from '../../../../core/api/dtos';

@Component({
  selector: 'app-tickets-tab',
  imports: [AsyncPipe, DatePipe, LowerCasePipe, LucideAngularModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tickets-tab.component.html',
  styleUrl: './tickets-tab.component.scss',
})
export class TicketsTabComponent {
  @Input() filteredTickets$: Observable<TicketSummaryDto[] | null> = new Observable<
    TicketSummaryDto[] | null
  >();
  @Output() selectedTicketId = new EventEmitter<string>();

  onTicketClick(id: string) {
    this.selectedTicketId.emit(id);
  }

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
}
