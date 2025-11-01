import { Component, ChangeDetectionStrategy, forwardRef, input, Input, InputSignal, computed } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
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
    @if(label){
      <mat-label> {{ label() }} @if(isRequired) { * }</mat-label>
    }
    <input
      matInput
      [type]="type()"
      [id]="id()"
      [value]="value"
      [disabled]="isDisabled"
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
export class InputComponent<T> extends ControlValueAccessorDirective<T>{
  id: InputSignal<string> = input.required<string>();
  type: InputSignal<InputType> = input<InputType>('text');
  label?: InputSignal<string|undefined> = input<string|undefined>(undefined);
  placeholder?: InputSignal<string|undefined> = input<string|undefined>(undefined);

  idSig = computed(() => this.controlSig()?.get('name'));

  constructor() {
    super();
    console.log(this.idSig());
  }
}
