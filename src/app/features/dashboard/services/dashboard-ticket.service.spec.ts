import { of } from 'rxjs';
import { DashboardTicketService } from './dashboard-ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketsService } from '../../../core/services/tickets.service';
import { TicketSummaryDto } from '../../../core/api/dtos';

const MOCK_TICKETS: TicketSummaryDto[] = [
  {
    id: '1',
    title: 'Test 1',
    status: 'open',
    priority: 'high',
    category: 'IT',
    created: '2026-01-01',
  },
  {
    id: '2',
    title: 'Test 2',
    status: 'completed',
    priority: 'low',
    category: 'HR',
    created: '2026-01-02',
  },
];

describe('DashboardTicketService', () => {
  let service: DashboardTicketService;
  let mockAuth: jest.Mocked<Pick<AuthService, 'getRole'>>;
  let mockTickets: jest.Mocked<Pick<TicketsService, 'getQueue' | 'getMy' | 'getAll' | 'create'>>;

  beforeEach(() => {
    mockAuth = {
      getRole: jest.fn(),
    };

    mockTickets = {
      getQueue: jest.fn(),
      getMy: jest.fn(),
      getAll: jest.fn(),
      create: jest.fn(),
    };

    service = new DashboardTicketService(
      mockAuth as unknown as AuthService,
      mockTickets as unknown as TicketsService
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTickets()', () => {
    it('should call getQueue() and getMy() when role is agent', () => {
      mockAuth.getRole.mockReturnValue('agent');
      mockTickets.getQueue.mockReturnValue(of(MOCK_TICKETS));
      mockTickets.getMy.mockReturnValue(of(MOCK_TICKETS));

      service.loadTickets();

      expect(mockTickets.getQueue).toHaveBeenCalled();
      expect(mockTickets.getMy).toHaveBeenCalled();
    });

    it('should call getAll() when role is admin', () => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTickets.getAll.mockReturnValue(of(MOCK_TICKETS));

      service.loadTickets();

      expect(mockTickets.getAll).toHaveBeenCalled();
    });

    it('should call getMy() when role is user', () => {
      mockAuth.getRole.mockReturnValue('user');
      mockTickets.getMy.mockReturnValue(of(MOCK_TICKETS));

      service.loadTickets();

      expect(mockTickets.getMy).toHaveBeenCalled();
    });
  });

  describe('createTicket()', () => {
    it('should call tickets.create() and trigger loadTickets()', () => {
      const createReq = { title: 'New', description: 'Desc', priority: 'high', category: 'IT' };
      mockTickets.create.mockReturnValue(of({}));
      mockAuth.getRole.mockReturnValue('user');
      mockTickets.getMy.mockReturnValue(of(MOCK_TICKETS));

      service.createTicket(createReq).subscribe();

      expect(mockTickets.create).toHaveBeenCalledWith(createReq);
      expect(mockTickets.getMy).toHaveBeenCalled();
    });
  });

  describe('filtering', () => {
    it('should filter tickets by status, priority, and type', (done) => {
      mockAuth.getRole.mockReturnValue('admin');
      mockTickets.getAll.mockReturnValue(of(MOCK_TICKETS));
      service.loadTickets();

      service.filterByStatus('open');
      service.filterByPriority('high');
      service.filterByType('it');

      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets.length).toBe(1);
        expect(tickets[0].id).toBe('1');
        done();
      });
    });
  });
});
