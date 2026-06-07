import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDetailsModalComponent } from './ticket-details-modal.component';

describe('TicketDetailsModalComponent', () => {
  let component: TicketDetailsModalComponent;
  let fixture: ComponentFixture<TicketDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
