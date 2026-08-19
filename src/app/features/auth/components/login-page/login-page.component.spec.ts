import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { FormBuilder } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { of, throwError } from 'rxjs';
import { AuthDto } from '../../../../core/api/dtos/auth.dto';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let mockAuth: jest.Mocked<Pick<AuthService, 'login' | 'saveToken' | 'saveUserProfile'>>;
  let mockNotification: jest.Mocked<Pick<NotificationService, 'error' | 'info'>>;

  beforeEach(() => {
    mockAuth = {
      login: jest
        .fn()
        .mockReturnValue(of({ token: 'token', firstName: 'John', lastName: 'Doe' } as AuthDto)),
      saveToken: jest.fn(),
      saveUserProfile: jest.fn(),
    };
    mockNotification = {
      error: jest.fn(),
      info: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuth },
        { provide: NotificationService, useValue: mockNotification },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should form be invalid on creation', () => {
    expect(component.form.invalid).toBeTruthy();
  });

  it('should form be valid when fields are filled', () => {
    component.form.get('login')?.setValue('test');
    component.form.get('password')?.setValue('test');
    expect(component.form.valid).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    component.submit();
    expect(component.submitted).toBeTruthy();
    expect(component.loading).toBeFalsy();

    expect(mockNotification.error).not.toHaveBeenCalled();
    expect(mockAuth.login).not.toHaveBeenCalled();
    expect(mockAuth.saveToken).not.toHaveBeenCalled();
    expect(mockAuth.saveUserProfile).not.toHaveBeenCalled();
  });

  it('should submit when form is valid', () => {
    component.form.get('login')?.setValue('test');
    component.form.get('password')?.setValue('test');
    component.submit();
    expect(mockAuth.login).toHaveBeenCalledTimes(1);
    expect(mockAuth.saveToken).toHaveBeenCalledTimes(1);
    expect(mockAuth.saveUserProfile).toHaveBeenCalledTimes(1);
    expect(mockNotification.info).toHaveBeenCalledTimes(1);
  });

  it('should push error on bad login', () => {
    mockAuth.login.mockReturnValue(of({ token: '', firstName: '', lastName: '' } as AuthDto));

    component.form.get('login')?.setValue('test');
    component.form.get('password')?.setValue('test');

    component.submit();

    expect(mockAuth.login).toHaveBeenCalledTimes(1);
    expect(mockAuth.saveToken).not.toHaveBeenCalled();
    expect(mockAuth.saveUserProfile).not.toHaveBeenCalled();
    expect(mockNotification.error).toHaveBeenCalledTimes(1);
  });

  it('should reset loading state on api error', () => {
    mockAuth.login.mockReturnValue(throwError(() => new Error('test')));

    component.form.get('login')?.setValue('test');
    component.form.get('password')?.setValue('test');

    component.submit();

    expect(component.loading).toBeFalsy();
    expect(mockAuth.saveToken).not.toHaveBeenCalled();
    expect(mockAuth.saveUserProfile).not.toHaveBeenCalled();
  });
});
