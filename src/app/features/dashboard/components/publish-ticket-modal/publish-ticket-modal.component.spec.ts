import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublishTicketModalComponent } from './publish-ticket-modal.component';
import { SimpleChange } from '@angular/core';

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
      deadline: '2050-10-10T12:00:00Z',
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
      open: new SimpleChange(false, true, true),
    });

    expect(component.form.get('title')?.value).toBe('Draft Ticket');
    expect(component.form.get('description')?.value).toBe('Some description');
    expect(component.form.get('deadline')?.value).toBe('2050-10-10');
  });

  it('should emit submitted event on valid submit', () => {
    const mockDateIso = new Date('2050-10-15').toISOString();
    jest.spyOn(component.submitted, 'emit');

    component.form.patchValue({
      title: 'Draft',
      description: 'Draft desc',
      deadline: '2050-10-15',
    });

    component.submit();

    expect(component.submitted.emit).toHaveBeenCalledWith({
      request: {
        title: 'Draft',
        description: 'Draft desc',
        deadline: mockDateIso,
      },
    });
  });

  it('should format date and emit submitted if valid (no draftData)', () => {
    jest.spyOn(component.submitted, 'emit');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().substring(0, 10);

    component.form.patchValue({
      title: 'New',
      description: 'Desc',
      deadline: dateStr,
    });

    component.submit();

    expect(component.submitted.emit).toHaveBeenCalled();
  });

  it('should mark all as touched if invalid submit', () => {
    jest.spyOn(component.form, 'markAllAsTouched');
    jest.spyOn(component.submitted, 'emit');
    component.submit();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(component.submitted.emit).not.toHaveBeenCalled();
  });

  it('should reset form when closed via ngOnChanges', () => {
    component.form.patchValue({ title: 'test' });

    component.ngOnChanges({
      open: new SimpleChange(true, false, false),
    });

    expect(component.form.get('title')?.value).toBe('');
  });

  it('should emit closed when close is called', () => {
    jest.spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
