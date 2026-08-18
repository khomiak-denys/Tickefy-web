import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationService } from '../../shared/services/notification.service';

const mockErrors = {
  errors: {
    Email: ['Email is already in use'],
    FirstName: ['First name is too short'],
    LastName: ['Last name is too short'],
  },
};

describe('errorInterceptor', () => {
  let notificationService: NotificationService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    notificationService = TestBed.inject(NotificationService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);

    jest.spyOn(notificationService, 'error');
    jest.clearAllMocks();
  });

  it('should push all errors from 400 response', () => {
    httpClient.get('/').subscribe({
      next: () => {},
      error: () => {},
    });
    const request = httpTestingController.expectOne('/');
    request.flush(mockErrors, { status: 400, statusText: 'Bad Request' });

    expect(notificationService.error).toHaveBeenCalledTimes(3);
    expect(notificationService.error).toHaveBeenCalledWith('Email is already in use');
    expect(notificationService.error).toHaveBeenCalledWith('First name is too short');
    expect(notificationService.error).toHaveBeenCalledWith('Last name is too short');
  });

  it('should push detail from 400 response without errors object', () => {
    httpClient.get('/').subscribe({
      next: () => {},
      error: () => {},
    });
    const request = httpTestingController.expectOne('/');
    request.flush({ detail: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });

    expect(notificationService.error).toHaveBeenCalledTimes(1);
    expect(notificationService.error).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should push only one error on other 4xx responses', () => {
    httpClient.get('/').subscribe({
      next: () => {},
      error: () => {},
    });
    const request = httpTestingController.expectOne('/');
    request.flush({ detail: 'Not Found' }, { status: 404, statusText: 'Not Found' });

    expect(notificationService.error).toHaveBeenCalledTimes(1);
    expect(notificationService.error).toHaveBeenCalledWith('Not Found');
  });

  it('should push only one error on 5xx responses', () => {
    httpClient.get('/').subscribe({
      next: () => {},
      error: () => {},
    });
    const request = httpTestingController.expectOne('/');
    request.flush(
      { detail: 'Internal Server Error' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(notificationService.error).toHaveBeenCalledTimes(1);
    expect(notificationService.error).toHaveBeenCalledWith('Internal Server Error');
  });

  it("shouldn't show any error on success 2xx responses", () => {
    httpClient.get('/').subscribe({
      next: () => {},
      error: () => {},
    });
    const request = httpTestingController.expectOne('/');
    request.flush({}, { status: 200, statusText: 'OK' });

    expect(notificationService.error).not.toHaveBeenCalled();
  });
});
