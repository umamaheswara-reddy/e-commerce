import { Injectable, inject } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NavigationService } from '../../shared/services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);

  canActivate(): Observable<boolean> {
    // Using Angular signals directly instead of observables
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      // User is already authenticated, redirect to home
      this.navigationService.navigateToHome();
      return of(false);
    } else {
      // User is not authenticated, allow access to login
      return of(true);
    }
  }
}
