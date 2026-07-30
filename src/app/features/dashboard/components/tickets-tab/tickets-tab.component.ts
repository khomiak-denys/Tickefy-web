import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe, DatePipe, LowerCasePipe, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { TicketSummaryDto } from '../../../../core/api/dtos';
import { StatusClassPipe } from '../../../../shared/pipes/status-class.pipe';
import { PriorityClassPipe } from '../../../../shared/pipes/priority-class.pipe';

@Component({
  selector: 'app-tickets-tab',
  imports: [
    AsyncPipe,
    DatePipe,
    LowerCasePipe,
    LucideAngularModule,
    NgClass,
    StatusClassPipe,
    PriorityClassPipe,
  ],
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
}
