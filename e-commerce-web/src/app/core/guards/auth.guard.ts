import { Injectable, inject } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NavigationService } from '../../shared/services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);

  canActivate(): Observable<boolean> {
    // Using Angular signals directly instead of observables
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      // User is authenticated, allow access to protected routes
      return of(true);
    } else {
      // User is not authenticated, redirect to login
      this.navigationService.navigateToLogin();
      return of(false);
    }
  }
}
