import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardTicketService } from './dashboard-ticket.service';
import { TicketsService } from '../../../core/services/tickets.service';
import { CreateTicketRequest, TicketSummaryDto } from '../../../core/api/dtos';

const MOCK_TICKETS: TicketSummaryDto[] = [
  {
    id: '1',
    title: 'Test 1',
    description: 'Desc 1',
    requester: null,
    assignedTeam: { id: 't1', name: 'IT Team', category: 'IT', manager: null },
    assignedAgent: null,
    status: 'open',
    priority: 'high',
    category: 'it',
    created: '2026-01-01',
    deadline: '2026-01-10',
  },
  {
    id: '2',
    title: 'Test 2',
    description: 'Desc 2',
    requester: null,
    assignedTeam: { id: 't2', name: 'HR Team', category: 'HR', manager: null },
    assignedAgent: null,
    status: 'completed',
    priority: 'low',
    category: 'hr',
    created: '2026-01-02',
    deadline: '2026-01-11',
  },
];

describe('DashboardTicketService', () => {
  let service: DashboardTicketService;
  let mockTickets: jest.Mocked<Pick<TicketsService, 'getQueue' | 'getMy' | 'getAll' | 'create'>>;

  beforeEach(() => {
    mockTickets = {
      getQueue: jest.fn(),
      getMy: jest.fn(),
      getAll: jest.fn(),
      create: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [DashboardTicketService, { provide: TicketsService, useValue: mockTickets }],
    });

    service = TestBed.inject(DashboardTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTickets()', () => {
    it('should call getQueue() when tabKey is "queue" and update queue tickets stream', (done) => {
      mockTickets.getQueue.mockReturnValue(of(MOCK_TICKETS));

      service.loadTickets('queue');

      expect(mockTickets.getQueue).toHaveBeenCalledTimes(1);
      service.filteredQueueTickets$.subscribe((tickets) => {
        expect(tickets).toEqual(MOCK_TICKETS);
        done();
      });
    });

    it('should call getMy() when tabKey is "my" and update my tickets stream', (done) => {
      mockTickets.getMy.mockReturnValue(of(MOCK_TICKETS));

      service.loadTickets('my');

      expect(mockTickets.getMy).toHaveBeenCalledTimes(1);
      service.filteredMyTickets$.subscribe((tickets) => {
        expect(tickets).toEqual(MOCK_TICKETS);
        done();
      });
    });

    it('should call getAll() when tabKey is "all" and update all tickets stream', (done) => {
      mockTickets.getAll.mockReturnValue(of(MOCK_TICKETS));

      service.loadTickets('all');

      expect(mockTickets.getAll).toHaveBeenCalledTimes(1);
      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets).toEqual(MOCK_TICKETS);
        done();
      });
    });

    it('should handle error when getQueue fails', () => {
      mockTickets.getQueue.mockReturnValue(throwError(() => new Error('Error')));

      expect(() => service.loadTickets('queue')).not.toThrow();
    });

    it('should handle error when getMy fails', () => {
      mockTickets.getMy.mockReturnValue(throwError(() => new Error('Error')));

      expect(() => service.loadTickets('my')).not.toThrow();
    });

    it('should handle error when getAll fails', () => {
      mockTickets.getAll.mockReturnValue(throwError(() => new Error('Error')));

      expect(() => service.loadTickets('all')).not.toThrow();
    });
  });

  describe('createTicket()', () => {
    it('should call tickets.create() and trigger loadTickets("my")', (done) => {
      const createReq: CreateTicketRequest = {
        title: 'New Ticket',
        description: 'Description',
        deadline: '2026-02-01',
      };
      mockTickets.create.mockReturnValue(of({} as any));
      mockTickets.getMy.mockReturnValue(of(MOCK_TICKETS));

      service.createTicket(createReq).subscribe(() => {
        expect(mockTickets.create).toHaveBeenCalledWith(createReq);
        expect(mockTickets.getMy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      mockTickets.getAll.mockReturnValue(of(MOCK_TICKETS));
      service.loadTickets('all');
    });

    it('should filter tickets by status', (done) => {
      service.filterByStatus('open');

      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets.length).toBe(1);
        expect(tickets[0].id).toBe('1');
        done();
      });
    });

    it('should filter tickets by priority', (done) => {
      service.filterByPriority('low');

      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets.length).toBe(1);
        expect(tickets[0].id).toBe('2');
        done();
      });
    });

    it('should filter tickets by type/category', (done) => {
      service.filterByType('hr');

      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets.length).toBe(1);
        expect(tickets[0].id).toBe('2');
        done();
      });
    });

    it('should filter tickets by status, priority, and type combined', (done) => {
      service.filterByStatus('open');
      service.filterByPriority('high');
      service.filterByType('it');

      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets.length).toBe(1);
        expect(tickets[0].id).toBe('1');
        done();
      });
    });

    it('should return all tickets when filters are set to "all"', (done) => {
      service.filterByStatus('all');
      service.filterByPriority('all');
      service.filterByType('all');

      service.filteredAllTickets$.subscribe((tickets) => {
        expect(tickets.length).toBe(2);
        done();
      });
    });
  });
});
