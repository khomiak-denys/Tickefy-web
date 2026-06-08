import { TestBed } from '@angular/core/testing';

import { DashboardTeamsService } from './dashboard-teams.service';

describe('DashboardTeamsService', () => {
  let service: DashboardTeamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardTeamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
