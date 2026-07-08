import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardTicketService } from './dashboard-ticket.service';

describe('DashboardTicketService', () => {
  let service: DashboardTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
