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
    @if (messages().length) {
      @for (msg of messages(); track msg) {
        <mat-error>{{ msg }}</mat-error>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationErrorsComponent {
  control = input<AbstractControl | undefined>(undefined);

  /** Dynamically compute messages when control or its errors change */
  messages: Signal<string[]> = computed(() => {
    const c = this.control();
    if (!c) return [];

    const errs = c.errors;
    const msgs: string[] = [];

    if(c.touched && errs) {
      if (errs['required']) msgs.push('This field is required');
      if (errs['email']) msgs.push('Please enter a valid email address');
      if (errs['minlength'])
        msgs.push(`Minimum length is ${errs['minlength'].requiredLength} characters`);
      if (errs['maxlength'])
        msgs.push(`Maximum length is ${errs['maxlength'].requiredLength} characters`);
      if (errs['pattern']) msgs.push('Invalid format');

      // Include any custom error message strings
      for (const key in errs) {
        const err = errs[key];
        if (typeof err === 'string') msgs.push(err);
        else if (err?.message) msgs.push(err.message);
      }
    }

    return msgs;
  });
}
