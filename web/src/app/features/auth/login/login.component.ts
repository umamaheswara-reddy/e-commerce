import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormService } from '../../../shared/services/form.service';
import { ILoginFormGroup } from '../../../shared/types/form.types';
import { AuthFacade } from '../services/auth.facade';
import { ErrorService } from '../../../shared/services/error.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { IAuthResult } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EButtonComponent } from '../../../ui/components/e-button/e-button.component';
import { EInputComponent } from '../../../ui/components/e-input/e-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    EButtonComponent,
    EInputComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private formService = inject(FormService);
  private authFacade = inject(AuthFacade);
  private errorService = inject(ErrorService);
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
    if (this.loginForm.invalid) {
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
        next: (result) => this.handleLoginResponse(result),
        error: (err) => this.handleLoginError(err),
      });
  }

  private handleLoginResponse(result: IAuthResult) {
    if (result.success) {
      this.authFacade.navigateToHome();
    } else {
      this.snackBar.open(result.message || 'Login failed', 'Close');
    }
  }

  private handleLoginError(error: HttpErrorResponse) {
    const userMessage = this.errorService.getUserFriendlyMessage(error);
    this.snackBar.open(userMessage, 'Close');
    this.logger.error('Login failed', error);
  }

  navigateToForgotPassword(): void {
    this.authFacade.navigateToForgotPassword();
  }

  navigateToRegister(): void {
    this.authFacade.navigateToRegister();
  }
}
