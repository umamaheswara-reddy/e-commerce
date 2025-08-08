import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

/**
 * Creates a reactive signal from a FormControl's valueChanges stream.
 * @param control FormControl to observe.
 * @param initialValue Fallback initial value.
 */
export function formControlSignal<T>(
  control: FormControl<T | null>,
  initialValue: T
) {
  return toSignal(
    control.valueChanges.pipe(startWith(control.value ?? initialValue)),
    { initialValue }
  );
}
