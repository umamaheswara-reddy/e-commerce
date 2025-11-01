import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  InputSignal,
  computed,
  inject
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorDirective } from '../../directives/control-value-accessor.directive';

type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'url';

@Component({
  selector: 'e-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field>
      @if (label()) {
        <mat-label>{{ label() }} @if(requiredSig()) { * }</mat-label>
      }
      <input
        matInput
        [type]="type()"
        [id]="idSig()"
        [value]="valueSig()"
        [disabled]="disabledSig()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
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
  label: InputSignal<string | null> = input<string | null>(null);
  placeholder?: InputSignal<string | undefined> = input<string | undefined>(undefined);

  // ✅ Generate a clean string id (controlName or fallback)
  idSig = computed(() => this.ngControl?.name?.toString() ?? '');

  constructor() {
    super();
  }
}