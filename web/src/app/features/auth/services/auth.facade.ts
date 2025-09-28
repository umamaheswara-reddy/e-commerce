import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthService,
  IAuthResult,
  AuthResponse,
} from '../../../core/services/auth.service';
import { NavigationService } from '../../../shared/services/navigation.service';

export interface IAuthFacade {
  login(email: string, password: string): Observable<IAuthResult>;
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ): Observable<AuthResponse>;
  navigateToHome(): void;
  navigateToForgotPassword(): void;
  navigateToRegister(): void;
  navigateToLogin(): void;
}

@Injectable({
  providedIn: 'root',
})
export class AuthFacade implements IAuthFacade {
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);

  login(email: string, password: string): Observable<IAuthResult> {
    return this.authService.login(email, password);
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ): Observable<AuthResponse> {
    return this.authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
    });
  }

  navigateToHome(): void {
    this.navigationService.navigateToHome();
  }

  navigateToForgotPassword(): void {
    this.navigationService.navigateToForgotPassword();
  }

  navigateToRegister(): void {
    this.navigationService.navigateToRegister();
  }

  navigateToLogin(): void {
    this.navigationService.navigateToLogin();
  }
}
