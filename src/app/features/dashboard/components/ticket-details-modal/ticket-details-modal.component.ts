import { Component } from '@angular/core';
import {TicketDetailsDto} from '../../../../core/api/dtos';
import {Observable} from 'rxjs';
import {LucideAngularModule} from 'lucide-angular/src/icons';

@Component({
  selector: 'app-ticket-details-modal',
  standalone: true,
  imports: [
    LucideAngularModule
  ],
  templateUrl: './ticket-details-modal.component.html',
  styleUrl: './ticket-details-modal.component.scss'
})
export class TicketDetailsModalComponent {
  ticketDetails$?: Observable<TicketDetailsDto | null>;
  detailsOpen = false;

  closeDetails() {
    this.detailsOpen = false;
    this.ticketDetails$ = undefined;
  }

  statusClass(status: any) {
    const s = String(status || 'open').toLowerCase();
    return {
      badge: true,
      open: s.startsWith('open') || (!s || s === ''),
      progress: s.includes('progress'),
      completed: s.startsWith('comp') || s.includes('completed'),
      failed: s.includes('fail'),
      cancelled: s.startsWith('canc') || s.includes('cancel'),
      assigned: s.includes('assign'),
      created: s.includes('created')
    };
  }
}
