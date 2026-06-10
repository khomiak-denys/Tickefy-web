import { TestBed } from '@angular/core/testing';

import { DashboardUserService } from './dashboard-user.service';

describe('DashboardUserService', () => {
  let service: DashboardUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
