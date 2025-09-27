import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { LoginFormService } from '../services/login-form.service';
import { AuthFacade } from '../services/auth.facade';
import { AuthErrorService } from '../services/auth-error.service';
import { LoggerService } from '../../../shared/services/logger.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let formServiceSpy: jasmine.SpyObj<LoginFormService>;
  let authFacadeSpy: jasmine.SpyObj<AuthFacade>;
  let errorServiceSpy: jasmine.SpyObj<AuthErrorService>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    const formSpy = jasmine.createSpyObj('LoginFormService', [
      'createForm',
      'markFormGroupTouched',
    ]);
    const authSpy = jasmine.createSpyObj('AuthFacade', [
      'login',
      'navigateToHome',
      'navigateToForgotPassword',
      'navigateToRegister',
    ]);
    const errorSpy = jasmine.createSpyObj('AuthErrorService', [
      'getUserFriendlyMessage',
    ]);
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: LoginFormService, useValue: formSpy },
        { provide: AuthFacade, useValue: authSpy },
        { provide: AuthErrorService, useValue: errorSpy },
        { provide: LoggerService, useValue: loggerSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    formServiceSpy = TestBed.inject(
      LoginFormService
    ) as jasmine.SpyObj<LoginFormService>;
    authFacadeSpy = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    errorServiceSpy = TestBed.inject(
      AuthErrorService
    ) as jasmine.SpyObj<AuthErrorService>;
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();

    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should call authFacade.login on valid form submission', () => {
    authFacadeSpy.login.and.returnValue(of({ success: true }));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authFacadeSpy.login).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
  });

  it('should navigate to home on successful login', () => {
    authFacadeSpy.login.and.returnValue(of({ success: true }));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(authFacadeSpy.navigateToHome).toHaveBeenCalled();
  });

  it('should show error on failed login', () => {
    authFacadeSpy.login.and.returnValue(
      of({ success: false, message: 'Invalid credentials' })
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    component.onSubmit();

    expect(component.loginError()).toBe('Invalid credentials');
  });

  it('should mark form controls as touched on invalid submission', () => {
    spyOn(component.loginForm.get('email')!, 'markAsTouched');
    spyOn(component.loginForm.get('password')!, 'markAsTouched');

    component.loginForm.setValue({
      email: '',
      password: '',
    });

    component.onSubmit();

    expect(component.loginForm.get('email')?.markAsTouched).toHaveBeenCalled();
    expect(
      component.loginForm.get('password')?.markAsTouched
    ).toHaveBeenCalled();
  });

  it('should navigate to forgot password', () => {
    component.navigateToForgotPassword();
    expect(authFacadeSpy.navigateToForgotPassword).toHaveBeenCalled();
  });

  it('should navigate to register', () => {
    component.navigateToRegister();
    expect(authFacadeSpy.navigateToRegister).toHaveBeenCalled();
  });
});
