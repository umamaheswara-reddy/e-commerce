import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  computed,
  effect,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import {
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ControlValueAccessorDirective } from '../../directives/control-value-accessor.directive';

export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'e-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field [appearance]="appearance()">
      <mat-label>{{ labelSig() }}</mat-label>

      <mat-select
        [id]="idSig()"
        [formControl]="control!"
        (blur)="onBlur()"
      >
        <!-- 👇 Placeholder shown conditionally -->
        @if (showPlaceholderSig()) {
          <mat-option [value]="null">
            -- Select --
          </mat-option>
        }

        <!-- Regular options -->
        @for (opt of options(); track opt.value) {
          <mat-option [value]="opt.value" [disabled]="opt.disabled">
            {{ opt.label }}
          </mat-option>
        }
      </mat-select>

      <!-- ✅ Validation messages -->
      @if (hasError()) {
        <mat-error>{{ validationMessageSig() }}</mat-error>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SelectComponent<T> extends ControlValueAccessorDirective<T> implements OnInit {
  appearance = input<MatFormFieldAppearance>('outline');
  options = input<SelectOption<T>[]>([]);

  // ✅ New configurable inputs
  isRequired = input<boolean>(false); // enable/disable required validation
  hidePlaceholderWhenEditing = input<boolean>(false); // hide placeholder when editing

  // 🧠 Derived label
  labelSig = computed(() => {
    const name = this.controlName?.toString() ?? '';
    if (!name) return '';
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  });

  idSig = computed(() => this.controlName?.toString() ?? '');

  // ✅ Signal to determine if placeholder should show
  readonly showPlaceholderSig = computed(() => {
    const hide = this.hidePlaceholderWhenEditing();
    const currentValue = this.control?.value;
    return !(hide && currentValue != null && currentValue !== undefined && currentValue !== '');
  });

constructor() {
    super();
    
    // 🧩 Apply conditional required validator reactively
    effect(() => {
      if (!this.control) return;
    
      const validators: ValidatorFn[] = [];
    
      // Add required validator if flag is true
      if (this.isRequired()) validators.push(Validators.required);
    
      // Preserve existing validators (if any)
      const existing = this.control.validator ? [this.control.validator] : [];
      this.control.setValidators([...existing, ...validators]);
      this.control.updateValueAndValidity({ emitEvent: false });
    });

    // ✅ Reactive disabled handling stays same
    effect(() => {
      if (!this.control) return;
      const isDisabled = this.disabledSig();
      if (isDisabled && this.control.enabled)
        this.control.disable({ emitEvent: false });
      else if (!isDisabled && this.control.disabled)
        this.control.enable({ emitEvent: false });
    });
  }
}
