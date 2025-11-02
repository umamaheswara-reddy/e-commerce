import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  InputSignal,
  computed,
  effect,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorDirective } from '../../directives/control-value-accessor.directive';
import { ValidationErrorsComponent } from '../e-validation-errors/e-validation-errors';

type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';

@Component({
  selector: 'e-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline">
      @if (label()) {
        <mat-label>{{ label() }}</mat-label>
      }

      <input
        matInput
        [type]="type()"
        [id]="idSig()"
        [value]="valueSig()"
        [attr.placeholder]="placeholder()"
        [attr.autocomplete]="autoCompleteSig()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [formControl]="control!"
      />

      @if (control?.hasError('required')) {
        <mat-error>This field is required</mat-error>
      }
      @if (control?.hasError('email')) {
        <mat-error>Please enter a valid email address</mat-error>
      }
      @if (control?.hasError('minlength')) {
        <mat-error>
          Minimum length is {{ control?.getError('minlength').requiredLength }} characters
        </mat-error>
      }
      @if (control?.hasError('maxlength')) {
        <mat-error>
          Maximum length is {{ control?.getError('maxlength').requiredLength }} characters
        </mat-error>
      }
      @if (control?.hasError('pattern')) {
        <mat-error>Invalid format</mat-error>
      }

      <!-- ToDo: <e-validation-errors [control]="control"></e-validation-errors> -->
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent<T> extends ControlValueAccessorDirective<T> {
  type = input<InputType>('text');
  label = input<string>('');
  placeholder = input<string>('');
  autocomplete = input<InputType | undefined>(undefined);

  idSig = computed(() => this.controlName?.toString() ?? '');

  autoCompleteSig = computed(() => {
    const explicit = this.autocomplete();
    if (explicit) return explicit;

    const name = (this.controlName?.toString().toLowerCase() ?? '');
    const type = this.type();

    if (type === 'email' || name.includes('email')) return 'email';
    if (name.includes('newpassword')) return 'new-password';
    if (name.includes('password')) return 'current-password';
    if (type === 'tel' || name.includes('phone') || name.includes('mobile')) return 'tel';
    if (type === 'url' || name.includes('url')) return 'url';
    if (name.includes('name')) return 'name';
    if (type === 'number') return 'off';

    return 'on';
  });

  constructor() {
    super();

    // ✅ Sync disabled state safely
    effect(() => {
      if (!this.control) return;
      const isDisabled = this.disabledSig();
      if (isDisabled && this.control.enabled) this.control.disable({ emitEvent: false });
      else if (!isDisabled && this.control.disabled) this.control.enable({ emitEvent: false });
    });
  }
}
