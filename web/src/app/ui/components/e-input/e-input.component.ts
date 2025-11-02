import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  InputSignal,
  computed,
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
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, ValidationErrorsComponent],
  template: `
    <mat-form-field>
      @if (label()) {
        <mat-label>{{ label() }}</mat-label>
      }
      <input
        matInput
        [type]="type()"
        [id]="idSig()"
        [value]="valueSig()"
        [disabled]="disabledSig()"
        [attr.placeholder]="placeholder()"
        [attr.autocomplete]="autoCompleteSig()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [formControl]="control!"
      />
      <!-- 👇 Auto error display -->
      @if (control) {
        <e-validation-errors [control]="control"></e-validation-errors>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class InputComponent<T> extends ControlValueAccessorDirective<T> {
  type: InputSignal<InputType> = input<InputType>('text');
  label: InputSignal<string> = input<string>('');
  placeholder: InputSignal<string> = input<string>('');

  /**
   * Optional override for autocomplete behavior
   * Example: <e-input autocomplete="new-password" />
   */
  autocomplete = input<InputType | undefined>(undefined);

  // ✅ Generate a clean string id (controlName or fallback)
  idSig = computed(() => this.controlName?.toString() ?? '');

  // ✅ Computed: auto-detect autocomplete (override if provided)
  autoCompleteSig = computed(() => {
    const explicit = this.autocomplete();
    if (explicit) return explicit; // provided value takes priority

    const rawName = this.controlName;
    const name =
      typeof rawName === 'string'
        ? rawName.toLowerCase()
        : rawName?.toString().toLowerCase() ?? '';

    const type = this.type();

    // 👇 smart defaults based on type or control name
    if (name.includes('email') || type === 'email') return 'email';
    if (name.includes('password') && name.includes('new')) return 'new-password';
    if (name.includes('password')) return 'current-password';
    if (name.includes('phone') || name.includes('mobile') || type === 'tel') return 'tel';
    if (name.includes('url') || type === 'url') return 'url';
    if (name.includes('name')) return 'name';
    if (type === 'number') return 'off';

    return 'on';
  });

}