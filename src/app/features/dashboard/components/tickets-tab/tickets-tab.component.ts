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
  @Input() hasPrevPage = false;
  @Input() hasNextPage = true;

  @Output() selectedTicketId = new EventEmitter<string>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() prevPage = new EventEmitter<void>();

  nextPageClick() {
    this.nextPage.emit();
  }

  prevPageClick() {
    this.prevPage.emit();
  }

  onTicketClick(id: string) {
    this.selectedTicketId.emit(id);
  }
}
