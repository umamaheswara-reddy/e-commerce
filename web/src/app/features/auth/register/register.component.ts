import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormService } from '../../../shared/services/form.service';
import { IRegisterFormControls } from '../../../shared/types/form.types';
import { FormGroup } from '@angular/forms';
import { AuthFacade } from '../services/auth.facade';
import { ErrorService } from '../../../shared/services/error.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { EButtonComponent } from '../../../ui/components/e-button/e-button.component';
import { EInputComponent } from '../../../ui/components/e-input/e-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    EButtonComponent,
    EInputComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private formService = inject(FormService);
  private authFacade = inject(AuthFacade);
  private errorService = inject(ErrorService);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  registerForm!: FormGroup<IRegisterFormControls>;

  // Using Angular signals instead of BehaviorSubject
  isLoading = signal(false);
  registerError = signal('');
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formService.createRegisterForm();
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }

  get firstName() {
    return this.registerForm.controls.firstName;
  }

  get lastName() {
    return this.registerForm.controls.lastName;
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.formService.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading.set(true);
    this.registerError.set('');

    const { email, password, firstName, lastName, role } =
      this.registerForm.getRawValue();

    this.authFacade
      .register(email, password, firstName, lastName, role)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.authFacade.navigateToHome();
          } else {
            this.registerError.set(result.message || 'Registration failed');
          }
        },
        error: (error: any) => {
          const userMessage = this.errorService.getUserFriendlyMessage(error);
          this.registerError.set(userMessage);
          this.logger.error('Registration failed', error);
        },
      });
  }

  navigateToLogin(): void {
    this.authFacade.navigateToLogin();
  }
}
