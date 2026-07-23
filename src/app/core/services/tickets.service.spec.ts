import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TicketsService } from './tickets.service';
import {
  CreateTicketRequest,
  PostCommentRequest,
  TicketDetailsDto,
  TicketSummaryDto,
} from '../api/dtos';

describe('TicketsService', () => {
  let service: TicketsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TicketsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a ticket via POST', () => {
    const dummyReq: CreateTicketRequest = {
      title: 'Test Ticket',
      description: 'Description test',
      priority: 'high',
      category: 'IT',
    };

    service.create(dummyReq).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/tickets') && r.method === 'POST');
    expect(req.request.body).toEqual(dummyReq);
    req.flush({ id: '1' });
  });

  it('should get all tickets via GET', () => {
    const dummyTickets: TicketSummaryDto[] = [
      {
        id: '1',
        title: 'Ticket 1',
        status: 'open',
        priority: 'medium',
        category: 'IT',
        created: '2026-01-01',
      },
    ];

    service.getAll().subscribe((tickets) => {
      expect(tickets).toEqual(dummyTickets);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/tickets') && r.method === 'GET');
    req.flush(dummyTickets);
  });

  it('should get my tickets via GET', () => {
    const dummyTickets: TicketSummaryDto[] = [];

    service.getMy().subscribe((tickets) => {
      expect(tickets).toEqual(dummyTickets);
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/my') && r.method === 'GET'
    );
    req.flush(dummyTickets);
  });

  it('should get queue tickets via GET', () => {
    const dummyTickets: TicketSummaryDto[] = [];

    service.getQueue().subscribe((tickets) => {
      expect(tickets).toEqual(dummyTickets);
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/queue') && r.method === 'GET'
    );
    req.flush(dummyTickets);
  });

  it('should get ticket by id via GET', () => {
    const dummyTicket: Partial<TicketDetailsDto> = { id: 't1', title: 'Ticket 1' };

    service.getById('t1').subscribe((ticket) => {
      expect(ticket).toEqual(dummyTicket as TicketDetailsDto);
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1') && r.method === 'GET'
    );
    req.flush(dummyTicket);
  });

  it('should post a comment via POST', () => {
    const commentReq: PostCommentRequest = { content: 'Nice ticket' };

    service.postComment('t1', commentReq).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/comment') && r.method === 'POST'
    );
    expect(req.request.body).toEqual(commentReq);
    req.flush({});
  });

  it('should complete a ticket via PUT', () => {
    service.complete('t1').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/complete') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should reopen a ticket via PUT', () => {
    service.reopen('t1').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/reopen') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should fail a ticket with reason via PUT', () => {
    service.fail('t1', 'Broken device').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/fail') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({ reason: 'Broken device' });
    req.flush({});
  });

  it('should cancel a ticket with reason via PUT', () => {
    service.cancel('t1', 'Not needed').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/cancel') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({ reason: 'Not needed' });
    req.flush({});
  });

  it('should take a ticket via PUT', () => {
    service.take('t1').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/take') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should accept a ticket via PUT', () => {
    service.accept('t1').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/accept') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should start work on a ticket via PUT', () => {
    service.startWork('t1').subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/api/v1/tickets/t1/start-work') && r.method === 'PUT'
    );
    expect(req.request.body).toEqual({});
    req.flush({});
  });
});
