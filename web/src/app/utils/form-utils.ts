import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { Signal } from '@angular/core';

// Overload for non-nullable controls
export function formControlSignal<T>(
  control: FormControl<T>,
  initialValue: T
): Signal<T>;

// Overload for nullable controls
export function formControlSignal<T>(
  control: FormControl<T | null>,
  initialValue: T
): Signal<T | null>;

// Implementation
export function formControlSignal<T>(
  control: FormControl<T | null>,
  initialValue: T
) {
  return toSignal(
    control.valueChanges.pipe(startWith(control.value ?? initialValue)),
    { initialValue: control.value ?? initialValue }
  );
}
