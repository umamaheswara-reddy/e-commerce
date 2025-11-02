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

  // 👇 Only visible when touched/dirty + has errors
  visible = computed(() => {
    const c = this.control;
    if (!c) return false;

    // Don’t show until control is actually interacted with
    const interacted = c.touched || c.dirty;
    const hasError = !!c.errors && c.invalid;

    return interacted && hasError;
    });

  // 👇 Generate readable messages
  messages: Signal<string[]> = computed(() => {
    const c = this.control;
    if (!c?.errors) return [];

    return Object.keys(c.errors).map((key) =>
      this.getErrorMessage(key, c.errors![key])
    );
  });

  private getErrorMessage(key: string, err: any): string {
    switch (key) {
      case 'required':   return 'This field is required.';
      case 'minlength':  return `Minimum length is ${err.requiredLength} characters.`;
      case 'maxlength':  return `Maximum length is ${err.requiredLength} characters.`;
      case 'email':      return 'Please enter a valid email address.';
      case 'pattern':    return 'Invalid format.';
      case 'min':        return `Minimum value is ${err.min}.`;
      case 'max':        return `Maximum value is ${err.max}.`;
      default:           return err?.message || 'Invalid value.';
    }
  }
}
