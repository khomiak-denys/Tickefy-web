import { Notification } from '../helpers/dto/notification.dto';
import { NotificationService } from './notification.service';

describe('NotificationServiceService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new NotificationService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be three notifications after add three times', () => {
    //Arrange
    service.info('one');
    service.error('two');
    service.info('three');

    //Act
    let result: Notification[] = [];
    service.notifications$.subscribe((v: Notification[]) => (result = v));

    //Assert
    expect(result.length).toBe(3);
    expect(result[0].type).toBe('info');
    expect(result[1].type).toBe('error');
    expect(result[2].type).toBe('info');

    expect(result[0].message).toBe('one');
    expect(result[1].message).toBe('two');
    expect(result[2].message).toBe('three');
  });

  it('should not be more than 3 notifications at the same time', () => {
    //Arrange
    service.info('one');
    service.error('two');
    service.info('three');
    service.error('four');

    //Act
    let result: Notification[] = [];
    service.notifications$.subscribe((v: Notification[]) => (result = v));

    //Assert
    expect(result.length).toBe(3);
    expect(result[0].type).toBe('info');
    expect(result[1].type).toBe('error');
    expect(result[2].type).toBe('info');

    expect(result[0].message).toBe('one');
    expect(result[1].message).toBe('two');
    expect(result[2].message).toBe('three');
  });

  it('should be three notifications after add three times and remove last', () => {
    //Arrange
    service.info('one');
    service.error('two');
    service.info('three');
    service.error('four');

    //Act 1
    let result: Notification[] = [];
    service.notifications$.subscribe((v: Notification[]) => (result = v));

    //Assert 1
    expect(result.length).toBe(3);
    expect(result[0].type).toBe('info');
    expect(result[1].type).toBe('error');
    expect(result[2].type).toBe('info');

    expect(result[0].message).toBe('one');
    expect(result[1].message).toBe('two');
    expect(result[2].message).toBe('three');

    //Act 2
    service.dismiss(result[0].id);

    //Assert
    expect(result.length).toBe(3);
    expect(result[0].type).toBe('error');
    expect(result[1].type).toBe('info');
    expect(result[2].type).toBe('error');

    expect(result[0].message).toBe('two');
    expect(result[1].message).toBe('three');
    expect(result[2].message).toBe('four');
  });

  it('should remove notification after 5 seconds', () => {
    //Arrange
    service.info('one');

    //Act 1
    let result: Notification[] = [];
    service.notifications$.subscribe((v: Notification[]) => (result = v));

    //Assert 1
    expect(result.length).toBe(1);
    expect(result[0].type).toBe('info');
    expect(result[0].message).toBe('one');

    //Act 2
    jest.advanceTimersByTime(3000);

    //Assert 2
    expect(result.length).toBe(0);
  });
});
