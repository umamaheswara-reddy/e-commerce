import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface INavigationService {
  navigateToHome(): void;
  navigateToLogin(): void;
  navigateToForgotPassword(): void;
  navigateToRegister(): void;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService implements INavigationService {
  private router = inject(Router);

  navigateToHome(): void {
    this.navigateTo('/home');
  }

  navigateToLogin(): void {
    this.navigateTo('/login');
  }

  navigateToForgotPassword(): void {
    this.navigateTo('/auth/forgot-password');
  }

  navigateToRegister(): void {
    this.navigateTo('/auth/register');
  }

  private navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
