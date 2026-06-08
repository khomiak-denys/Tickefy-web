import { TestBed } from '@angular/core/testing';

import { DashboardLogsService } from './dashboard-logs.service';

describe('DashboardLogsService', () => {
  let service: DashboardLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardLogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
