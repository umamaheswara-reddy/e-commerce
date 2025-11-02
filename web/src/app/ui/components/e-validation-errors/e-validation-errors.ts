import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'e-validation-errors',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule],
  template: `
    @for (msg of messages(); track msg) {
      <mat-error>{{ msg }}</mat-error>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationErrorsComponent {
  control = input.required<AbstractControl>();

  /**
   * Returns validation messages only when control is invalid
   * and has validation errors. Shows them automatically when
   * Angular marks the control as touched/dirty.
   */
  messages: Signal<string[]> = computed(() => {
    const c = this.control();
    if (!c || !c.errors || !c.invalid) return [];

    const errs = c.errors;
    const msgs: string[] = [];

    if (errs['required']) msgs.push('This field is required');
    if (errs['email']) msgs.push('Please enter a valid email address');
    if (errs['minlength'])
      msgs.push(`Minimum length is ${errs['minlength'].requiredLength} characters`);
    if (errs['maxlength'])
      msgs.push(`Maximum length is ${errs['maxlength'].requiredLength} characters`);
    if (errs['pattern']) msgs.push('Invalid format');

    // Handle any custom error messages
    for (const key in errs) {
      const err = errs[key];
      if (typeof err === 'string') msgs.push(err);
      else if (err?.message) msgs.push(err.message);
    }

    return msgs;
  });
}
