import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormService } from '../../../shared/services/form.service';
import { ILoginFormGroup } from '../../../shared/types/form.types';
import { AuthFacade } from '../services/auth.facade';
import { AuthErrorService } from '../services/auth-error.service';
import { LoggerService } from '../../../shared/services/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private formService = inject(FormService);
  private authFacade = inject(AuthFacade);
  private errorService = inject(AuthErrorService);
  private logger = inject(LoggerService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  loginForm!: ILoginFormGroup;

  // Using Angular signals instead of BehaviorSubject
  isLoading = signal(false);
  hidePassword = signal(true);

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formService.createLoginForm();
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.formService.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.getRawValue();

    this.authFacade
      .login(email, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.authFacade.navigateToHome();
          } else {
            this.snackBar.open(result.message || 'Login failed', 'Close', {
              duration: 5000,
            });
          }
        },
        error: (error: any) => {
          const userMessage = this.errorService.getUserFriendlyMessage(error);
          this.snackBar.open(userMessage, 'Close', {
            duration: 5000,
          });
          this.logger.error('Login failed', error);
        },
      });
  }

  navigateToForgotPassword(): void {
    this.authFacade.navigateToForgotPassword();
  }

  navigateToRegister(): void {
    this.authFacade.navigateToRegister();
  }
}
