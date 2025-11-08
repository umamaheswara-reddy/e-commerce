import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <mat-form-field [appearance]="appearance()">
      <mat-label>{{ labelSig() }}</mat-label>

      <mat-select
        [id]="idSig()"
        [formControl]="control!"
        (blur)="onBlur()"
      >
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
export class SelectComponent<T> extends ControlValueAccessorDirective<T> {
  appearance = input<MatFormFieldAppearance>('outline');
  options = input<SelectOption<T>[]>([]);

  // 🧠 Auto label based on control name
  labelSig = computed(() => {
    const name = this.controlName?.toString() ?? '';
    if (!name) return '';
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  });

  idSig = computed(() => this.controlName?.toString() ?? '');

  constructor() {
    super();

    // ✅ Sync control disabled state reactively
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
