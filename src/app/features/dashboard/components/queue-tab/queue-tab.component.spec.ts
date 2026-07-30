import { QueueTabComponent } from './queue-tab.component';

describe('QueueTabComponent', () => {
  let component: QueueTabComponent;

  beforeEach(async () => {
    component = new QueueTabComponent();
  });

  it('should emit acceptedTicketId when onAcceptClick is called', () => {
    const ticketId = '1';
    const emitSpy = jest.spyOn(component.acceptedTicketId, 'emit');

    component.onAcceptClick(ticketId);

    expect(emitSpy).toHaveBeenCalledWith(ticketId);
  });
});
