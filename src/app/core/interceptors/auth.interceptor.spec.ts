import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth.service';

jest.mock('../config/env.config', () => ({
  appEnv: {
    NG_APP_API_BASE_URL: 'http://localhost:5000',
    NG_APP_JWT_ISSUER: 'tickefy',
    NG_APP_JWT_AUDIENCE: 'tickefy-web',
  },
}));

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let authService: AuthService;
  let getTokenSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    authService = TestBed.inject(AuthService);
    getTokenSpy = jest.spyOn(authService, 'getAccessToken').mockReturnValue('fake-token');
  });

  it('Token exists', () => {
    const req = new HttpRequest('GET', '/auth');
    const next = jest.fn().mockReturnValue(of({}));
    interceptor(req, next);
    const clonedRequest = next.mock.calls[0][0];

    expect(clonedRequest.headers.get('Authorization')).toEqual('Bearer fake-token');
  });

  it('Token not exists', () => {
    const req = new HttpRequest('GET', '/auth');
    const next = jest.fn().mockReturnValue(of({}));
    getTokenSpy.mockReturnValue('');
    interceptor(req, next);
    const clonedRequest = next.mock.calls[0][0];

    expect(clonedRequest).toEqual(req);
  });
});
