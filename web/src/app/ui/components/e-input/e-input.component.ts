import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  computed,
  effect,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorDirective } from '../../directives/control-value-accessor.directive';

type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';

@Component({
  selector: 'e-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-form-field [appearance]="appearance()">
      <mat-label>{{ labelSig() }}</mat-label>

      <input
        matInput
        [type]="type()"
        [id]="idSig()"
        [value]="valueSig()"
        [attr.placeholder]="placeholderSig()"
        [attr.autocomplete]="autoCompleteSig()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [formControl]="control!"
      />

      <!-- ✅ Validation messages -->
      @if (hasError()) {
        <mat-error>{{ validationMessageSig() }}</mat-error>
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
  type = input<InputType>('text');
  placeholder = input<string>('');
  appearance = input<MatFormFieldAppearance>('outline');

  // 🧠 Auto derive label from controlName
  labelSig = computed(() => {
    const name = this.controlName?.toString() ?? '';
    if (!name) return '';
    return name
      .replace(/([A-Z])/g, ' $1')   // convert camelCase or PascalCase → spaced words
      .replace(/^./, (s) => s.toUpperCase()) // capitalize first letter
      .trim();
  });

  idSig = computed(() => this.controlName?.toString() ?? '');

  placeholderSig = computed(() => this.placeholder() || this.labelSig());

  autoCompleteSig = computed(() => {
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

    // ✅ Keep control enabled/disabled in sync reactively
    effect(() => {
      if (!this.control) return;
      const isDisabled = this.disabledSig();
      if (isDisabled && this.control.enabled) this.control.disable({ emitEvent: false });
      else if (!isDisabled && this.control.disabled) this.control.enable({ emitEvent: false });
    });
  }
}
