import { TestBed } from '@angular/core/testing';

import { DashboardTicketService } from './dashboard-ticket.service';

describe('DashboardTicketService', () => {
  let service: DashboardTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
