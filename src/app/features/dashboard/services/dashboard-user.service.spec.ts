import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardUserService } from './dashboard-user.service';

describe('DashboardUserService', () => {
  let service: DashboardUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
