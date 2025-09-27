import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, IAuthResult } from '../../../core/services/auth.service';
import { NavigationService } from '../../../shared/services/navigation.service';

export interface IAuthFacade {
  login(email: string, password: string): Observable<IAuthResult>;
  navigateToHome(): void;
  navigateToForgotPassword(): void;
  navigateToRegister(): void;
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

  navigateToHome(): void {
    this.navigationService.navigateToHome();
  }

  navigateToForgotPassword(): void {
    this.navigationService.navigateToForgotPassword();
  }

  navigateToRegister(): void {
    this.navigationService.navigateToRegister();
  }
}
