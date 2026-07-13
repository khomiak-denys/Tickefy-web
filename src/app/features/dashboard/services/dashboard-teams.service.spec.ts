import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DashboardTeamsService } from './dashboard-teams.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamsService } from '../../../core/services/teams.service';
import { TeamDetails, TeamSummary } from '../../../core/api/dtos';

const MOCK_TEAMS: TeamSummary[] = [
  { id: '1', name: 'Alpha', category: 'IT', manager: null },
  { id: '2', name: 'Beta', category: 'Design', manager: null },
];

const MOCK_TEAM_DETAILS: TeamDetails = {
  id: '1',
  name: 'Alpha',
  category: 'IT',
  manager: null,
  description: 'First team',
  members: [{ id: 'u1', firstName: 'John', lastName: 'Doe' }],
};

describe('DashboardTeamsService', () => {
  let service: DashboardTeamsService;
  let mockAuth: jest.Mocked<Pick<AuthService, 'getRole'>>;
  let mockTeams: jest.Mocked<
    Pick<
      TeamsService,
      'getAll' | 'getMy' | 'getById' | 'create' | 'addMemberByLogin' | 'removeMember'
    >
  >;

  beforeEach(() => {
    mockAuth = {
      getRole: jest.fn(),
    };

    mockTeams = {
      getAll: jest.fn(),
      getMy: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      addMemberByLogin: jest.fn(),
      removeMember: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardTeamsService,
        { provide: AuthService, useValue: mockAuth },
        { provide: TeamsService, useValue: mockTeams },
      ],
    });

    service = TestBed.inject(DashboardTeamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTeams()', () => {
    it('should call getAll() when role is admin', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(of(MOCK_TEAMS));

      service.loadTeams();

      expect(mockTeams.getAll).toHaveBeenCalled();
      expect(mockTeams.getMy).not.toHaveBeenCalled();
    });

    it('should call getMy() when role is non-admin (e.g. manager)', () => {
      mockAuth.getRole.mockReturnValue('manager');
      mockTeams.getMy.mockReturnValue(of(MOCK_TEAMS));

      service.loadTeams();

      expect(mockTeams.getMy).toHaveBeenCalled();
      expect(mockTeams.getAll).not.toHaveBeenCalled();
    });

    it('should not make any request when role is null', () => {
      mockAuth.getRole.mockReturnValue(null);

      service.loadTeams();

      expect(mockTeams.getAll).not.toHaveBeenCalled();
      expect(mockTeams.getMy).not.toHaveBeenCalled();
    });

    it('should push data into teams$ on success', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(of(MOCK_TEAMS));

      service.loadTeams();

      expect(service.teams$.value).toEqual(MOCK_TEAMS);
    });

    it('should push error into teamError$ on failure', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(throwError(() => 'Network error'));

      service.loadTeams();

      expect(service.teamError$.value).toBe('Network error');
    });

    it('should reuse cached observable on second call (not fetch again)', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(of(MOCK_TEAMS));

      service.loadTeams();
      service.loadTeams();

      expect(mockTeams.getAll).toHaveBeenCalledTimes(1);
    });

    it('should fetch fresh data after invalidateTeamsListCache()', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(of(MOCK_TEAMS));
      service.loadTeams();
      expect(mockTeams.getAll).toHaveBeenCalledTimes(1);

      service.invalidateTeamsListCache();

      const freshTeams: TeamSummary[] = [
        { id: '3', name: 'Gamma', category: 'Marketing', manager: null },
      ];
      mockTeams.getAll.mockReturnValue(of(freshTeams));
      service.loadTeams();

      expect(mockTeams.getAll).toHaveBeenCalledTimes(2);
      expect(service.teams$.value).toEqual(freshTeams);
    });
  });

  describe('getById()', () => {
    it('should call teams.getById() on first call', () => {
      mockTeams.getById.mockReturnValue(of(MOCK_TEAM_DETAILS));

      service.getById('1').subscribe();

      expect(mockTeams.getById).toHaveBeenCalledWith('1');
    });

    it('should return cached observable on second call for same id', () => {
      mockTeams.getById.mockReturnValue(of(MOCK_TEAM_DETAILS));

      const first = service.getById('1');
      const second = service.getById('1');

      expect(first).toBe(second);
      expect(mockTeams.getById).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTeam()', () => {
    it('should call teams.create() and trigger loadTeams()', () => {
      const createReq = { name: 'New Team', description: 'Desc', category: null };
      mockTeams.create.mockReturnValue(of({}));
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(of(MOCK_TEAMS));

      service.createTeam(createReq).subscribe();

      expect(mockTeams.create).toHaveBeenCalledWith(createReq);
      expect(mockTeams.getAll).toHaveBeenCalled();
    });
  });

  describe('member operations', () => {
    it('addMemberByLogin should invalidate the team details cache', () => {
      mockTeams.getById.mockReturnValue(of(MOCK_TEAM_DETAILS));
      service.getById('1').subscribe();
      expect(mockTeams.getById).toHaveBeenCalledTimes(1);

      mockTeams.addMemberByLogin.mockReturnValue(of({}));

      service.addMemberByLogin('1', 'jane_doe').subscribe();

      service.getById('1').subscribe();

      expect(mockTeams.getById).toHaveBeenCalledTimes(2);
    });

    it('removeMember should invalidate the team details cache', () => {
      mockTeams.getById.mockReturnValue(of(MOCK_TEAM_DETAILS));
      service.getById('1').subscribe();
      expect(mockTeams.getById).toHaveBeenCalledTimes(1);

      mockTeams.removeMember.mockReturnValue(of({}));

      service.removeMember('1', 'u1').subscribe();

      service.getById('1').subscribe();

      expect(mockTeams.getById).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidateTeamsListCache()', () => {
    it('should reset cache so next loadTeams() fetches fresh data', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTeams.getAll.mockReturnValue(of(MOCK_TEAMS));
      service.loadTeams();

      service.loadTeams();
      expect(mockTeams.getAll).toHaveBeenCalledTimes(1);

      service.invalidateTeamsListCache();

      service.loadTeams();

      expect(mockTeams.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
