import { DashboardUserService } from './dashboard-user.service';
import { AuthService } from '../../../core/services/auth.service';
import {UsersService} from '../../../core/services/users.service';
import {Observable, of, throwError} from 'rxjs';
import {TeamSummary, UserDto, UserShortDto} from '../../../core/api/dtos';

describe('DashboardUserService', () => {
  let service: DashboardUserService;
  let mockAuth: jest.Mocked<Pick<AuthService, 'getRole'>>;
  let mockUsers: jest.Mocked<
    Pick<UsersService, 'getAll' | 'delete'>
  >;

  beforeEach(() => {
    mockAuth = {
      getRole: jest.fn(),
    };

    mockUsers = {
      getAll: jest.fn(),
      delete: jest.fn(),
    };

    service = new DashboardUserService(mockAuth as any, mockUsers as any)
  });

  describe('loadUsers()', () => {

    it('getAll should not be called when role is not admin & cache is null', () => {
      mockAuth.getRole.mockReturnValue('user');

      service.loadUsers();

      expect(mockAuth.getRole).toHaveBeenCalled();
      expect(mockUsers.getAll).not.toHaveBeenCalled();
    });

    it('getAll should be called once', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockUsers.getAll.mockReturnValue(of([]));

      service.loadUsers();
      service.loadUsers();

      expect(mockUsers.getAll).toHaveBeenCalledTimes(1);
    });

    it ('role changed after cache populated', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockUsers.getAll.mockReturnValue(of([]));

      service.loadUsers();

      mockAuth.getRole.mockReturnValue('user');
      service.loadUsers();

      expect(mockAuth.getRole).toHaveBeenCalledTimes(1);
    });

    it('getAll should be called after cache invalidation', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockUsers.getAll.mockReturnValue(of([]));

      service.loadUsers();
      service.invalidateUsersListCache();
      service.loadUsers();

      expect(mockUsers.getAll).toHaveBeenCalledTimes(2);
    });

    it ( 'usersSource$ should get value on success http call', () => {
      const MOCK_TEAM: TeamSummary = {
        id: '1',
        name: null,
        category: null,
        manager: null
      };

      const MOCK_USERS: UserDto[] = [
        {id: '1', firstName: 'A', lastName: 'B', login: 'A', role: 'User', team: MOCK_TEAM, created: Date.now().toString()},
        {id: '2', firstName: 'C', lastName: 'D', login: 'B', role: 'User', team: MOCK_TEAM, created: Date.now().toString()},
      ];

      mockAuth.getRole.mockReturnValue('admin');
      mockUsers.getAll.mockReturnValue(of(MOCK_USERS));

      let users: UserDto[] | null = null;
      const sub = service.filteredUsers$.subscribe(data => {
        users = data;
      });

      service.loadUsers();

      expect(users).toEqual(MOCK_USERS);
    });

    it ( 'error$ should get value on http failure', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockUsers.getAll.mockReturnValue(throwError(() => 'Network error'));

      let errorValue: string | null = null;
      const sub = service.userError$.subscribe(err => {
        errorValue = err;
      });

      service.loadUsers();

      expect(errorValue).toBe('Network error');
    });
  });
});
