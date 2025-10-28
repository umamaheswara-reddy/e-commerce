import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  Injector,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  E_INPUT_DEFAULT_OPTIONS,
  EInputOptions,
} from '../../tokens/e-ui.tokens';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'e-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field [appearance]="options().appearance" class="w-full">
      <mat-label>{{ label }}</mat-label>

      <input
        matInput
        [type]="type"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="markAsTouched()"
      />

      @if(showError()){
      <mat-error>
        {{ firstErrorMessage() }}
      </mat-error>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: EInputComponent,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';

  value = signal('');
  options = signal<EInputOptions>({ appearance: 'outline', floatLabel:'always' });

  private injector = inject(Injector);
  private defaults = inject(E_INPUT_DEFAULT_OPTIONS);

  private ngControl: NgControl | null = null;
  private onChange = (v: any) => {};
  private onTouched = () => {};

  constructor() {
    // 👇 delay NgControl resolution to break circular dependency
    Promise.resolve().then(() => {
      this.ngControl = this.injector.get(NgControl, null, { optional: true });
      if (this.ngControl) {
        this.ngControl.valueAccessor = this;
      }
    });

    this.options.set(this.defaults);
  }

  writeValue(v: any): void {
    this.value.set(v ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    this.onTouched();
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  showError() {
    const control = this.ngControl?.control;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  firstErrorMessage(): string | null {
    const control = this.ngControl?.control;
    if (!control?.errors) return null;

    const errors = control.errors;
    if (errors['required']) return `${this.label} is required`;
    if (errors['email']) return `Please enter a valid email`;
    if (errors['minlength'])
      return `${this.label} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength'])
      return `${this.label} must be at most ${errors['maxlength'].requiredLength} characters`;
    return `Invalid ${this.label}`;
  }
}
