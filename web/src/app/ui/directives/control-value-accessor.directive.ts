import {
  Directive,
  computed,
  DestroyRef,
  inject,
  OnInit,
  effect,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NgControl,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith, distinctUntilChanged, tap } from 'rxjs';

@Directive({
  selector: '[appControlValueAccessor]',
})
export class ControlValueAccessorDirective<T>
  implements ControlValueAccessor, OnInit {

  // ✅ Dependency injection
  protected readonly ngControl = inject(NgControl, { optional: true });
  private readonly formGroupDir = inject(FormGroupDirective, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  // ✅ State
  protected control?: FormControl<T>;
  protected value: T | null = null;
  isRequired = false;
  isDisabled = false;

  // ✅ Callbacks (ControlValueAccessor)
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  // ✅ Computed signal for reactivity
  readonly controlSig = computed(() => this.control);
  readonly showError = computed(() =>
    !!(this.control && this.control.invalid && (this.control.dirty || this.control.touched))
  );

  ngOnInit(): void {
    this.bindFormControl();
    this.isRequired = this.control?.hasValidator?.(Validators.required) ?? false;
  }

  private bindFormControl(): void {
    // ✅ Avoid try/catch — simpler & more predictable control binding
    if (!this.ngControl) return;

    if (this.ngControl instanceof FormControlName && this.formGroupDir) {
      this.control = this.formGroupDir.getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.control = this.ngControl.form as FormControl<T>;
    }
  }

  // ✅ CVA methods
  writeValue(value: T): void {
    this.value = value;
  }

  registerOnChange(fn: (val: T | null) => void): void {
    this.onChange = fn;

    // ⚙️ Subscribe once and manage cleanup automatically
    this.control?.valueChanges
      ?.pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(this.control.value),
        distinctUntilChanged()
      )
      .subscribe((val) => fn(val));
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onBlur(): void {
    this.onTouched();
  }

  onInput(event: Event): void {
    if (this.isDisabled) return;
    const inputValue = (event.target as HTMLInputElement).value as unknown as T;
    this.value = inputValue;
    this.onChange(inputValue);
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
