import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardLogsService } from './dashboard-logs.service';

describe('DashboardLogsService', () => {
  let service: DashboardLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardLogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
