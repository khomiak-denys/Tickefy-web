import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublishTicketModalComponent } from './publish-ticket-modal.component';

describe('PublishTicketModalComponent', () => {
  let component: PublishTicketModalComponent;
  let fixture: ComponentFixture<PublishTicketModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishTicketModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishTicketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form fields when draftData is provided', () => {
    component.draftData = {
      id: '123',
      title: 'Draft Ticket',
      description: 'Some description',
      deadline: '2026-10-10T12:00:00Z',
      category: 'Bug',
      priority: 'high',
      status: 'draft',
      created: '2026-08-10T12:00:00Z',
      requester: null,
      assignedTeam: { id: 't1', name: 'Dev', category: 'Dev', manager: null },
      assignedAgent: null,
      comments: [],
      availableActions: [],
      attachments: [],
    };

    // Trigger ngOnChanges
    component.ngOnChanges({
      open: {
        currentValue: true,
        previousValue: false,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.newTitle).toBe('Draft Ticket');
    expect(component.newDescription).toBe('Some description');
    expect(component.newDeadline).toBe('2026-10-10'); // should substring(0, 10)
  });

  it('should emit published event on valid submit', () => {
    jest.spyOn(component.published, 'emit');

    component.newTitle = 'Valid Title';
    component.newDeadline = '2026-10-15';
    component.newDescription = 'Valid desc';

    component.submit();

    expect(component.error).toBeNull();
    expect(component.published.emit).toHaveBeenCalledWith({
      request: {
        title: 'Valid Title',
        description: 'Valid desc',
        deadline: new Date('2026-10-15').toISOString(),
      },
    });
  });

  it('should show error if title or deadline is missing', () => {
    jest.spyOn(component.published, 'emit');

    component.newTitle = '';
    component.newDeadline = '2026-10-15';

    component.submit();

    expect(component.error).toBe('Title and deadline are required');
    expect(component.published.emit).not.toHaveBeenCalled();
  });
});
