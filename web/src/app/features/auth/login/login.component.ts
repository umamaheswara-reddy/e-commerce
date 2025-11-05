import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

// 🧱 UI Components
import { ButtonComponent } from '../../../ui/components/e-button/e-button.component';
import { InputComponent } from '../../../ui/components/e-input/e-input.component';
import {
  CardComponent,
  CardContentComponent,
  CardActionsComponent,
} from '../../../ui/components/e-card';

// 🧠 Services & Types
import { FormService } from '../../../shared/services/form.service';
import { AuthFacade } from '../services/auth.facade';
import { ErrorService } from '../../../shared/services/error.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { IAuthResult } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    CardContentComponent,
    CardActionsComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // ==============================
  // 🧩 Dependency Injection
  // ==============================
  private readonly formService = inject(FormService);
  private readonly authFacade = inject(AuthFacade);
  private readonly errorService = inject(ErrorService);
  private readonly logger = inject(LoggerService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  // ==============================
  // 💡 State
  // ==============================
  readonly isLoading = signal(false);
  readonly loginForm = this.formService.createLoginForm();

  // ==============================
  // 📬 Form Getters (for template binding)
  // ==============================
  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  // ==============================
  // 🚀 Submit Handler
  // ==============================
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.formService.markFormGroupTouched(this.loginForm);
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);

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

  // ==============================
  // ✅ Response Handling
  // ==============================
  private handleLoginResponse(result: IAuthResult): void {
    if (result.success) {
      this.authFacade.navigateToHome();
      return;
    }

    this.showSnack(result.message || 'Login failed');
  }

  private handleLoginError(error: HttpErrorResponse): void {
    const message = this.errorService.getUserFriendlyMessage(error);
    this.showSnack(message);
    this.logger.error('Login failed', error);
  }

  // ==============================
  // 🧭 Navigation
  // ==============================
  navigateToForgotPassword(): void {
    this.authFacade.navigateToForgotPassword();
  }

  navigateToRegister(): void {
    this.authFacade.navigateToRegister();
  }

  // ==============================
  // 🍬 Utility
  // ==============================
  private showSnack(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
