import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { TicketSummaryDto } from '../../../../core/api/dtos';
import { LucideAngularModule } from 'lucide-angular';
import { AsyncPipe, DatePipe, NgClass, LowerCasePipe } from '@angular/common';
import { StatusClassPipe } from '../../../../shared/pipes/status-class.pipe';
import { PriorityClassPipe } from '../../../../shared/pipes/priority-class.pipe';

@Component({
  selector: 'app-queue-tab',
  imports: [
    AsyncPipe,
    DatePipe,
    NgClass,
    LucideAngularModule,
    LowerCasePipe,
    StatusClassPipe,
    PriorityClassPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queue-tab.component.html',
  styleUrl: './queue-tab.component.scss',
})
export class QueueTabComponent {
  @Input() filteredTickets$: Observable<TicketSummaryDto[] | null> = new Observable<
    TicketSummaryDto[] | null
  >();
  @Input() hasPrevPage = false;
  @Input() hasNextPage = true;

  @Output() acceptedTicketId = new EventEmitter<string>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() prevPage = new EventEmitter<void>();

  nextPageClick() {
    this.nextPage.emit();
  }

  prevPageClick() {
    this.prevPage.emit();
  }

  onAcceptClick(id: string) {
    this.acceptedTicketId.emit(id);
  }
}
