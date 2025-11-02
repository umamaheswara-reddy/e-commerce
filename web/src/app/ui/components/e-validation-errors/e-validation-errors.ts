import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
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
    @if (visible()) {
      @for (msg of messages(); track msg) {
        <mat-error>{{ msg }}</mat-error>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationErrorsComponent {
  @Input({ required: true }) control!: AbstractControl | null;

  // Show only after interaction and when invalid
  visible = computed(() => {
    const c = this.control;
    if (!c) return false;

    const interacted = c.touched || c.dirty;
    const hasError = !!c.errors && c.invalid;

    return interacted && hasError;
  });

  // Automatically show the values in the Angular error object
  messages: Signal<string[]> = computed(() => {
    const c = this.control;
    if (!c?.errors) return [];

    // Each error object might contain string messages or structured objects.
    // We’ll extract readable strings from them.
    return Object.values(c.errors).map((err) => {
      if (typeof err === 'string') return err;              // e.g. { customError: 'Message here' }
      if (typeof err === 'boolean') return '';              // e.g. { required: true }
      if (err?.message) return err.message;                 // e.g. { backendError: { message: 'Invalid token' } }
      return JSON.stringify(err);                           // fallback for unknown formats
    }).filter(m => !!m); // remove empty strings
  });
}
