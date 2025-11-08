import {
  Directive,
  DestroyRef,
  OnInit,
  inject,
  computed,
  signal,
  effect,
  Injector,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NgControl,
  ValidationErrors,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, startWith, merge } from 'rxjs';

@Directive({
  selector: '[appControlValueAccessor]',
})
export class ControlValueAccessorDirective<T>
  implements ControlValueAccessor, OnInit
{
  private readonly formGroupDir = inject(FormGroupDirective, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected control?: FormControl<T>;
  protected ngControl?: NgControl;

  // base signals
  protected readonly valueSig = signal<T | null>(null);
  protected readonly disabledSig = signal(false);

  // internal signal to track validation state reactively
  private readonly errorsSig = signal<ValidationErrors | null>(null);

  // derived signals
  readonly showError = computed(() => {
    const control = this.control;
    return !!(control && control.invalid && (control.dirty || control.touched));
  });

  /**
   * ⚡ Reactive validation message signal
   * Updates automatically whenever control errors or state changes
   */
  readonly validationMessageSig = computed<string | null>(() => {
    if (!this.showError()) return null;

    const errors = this.errorsSig();
    if (!errors) return null;

    // 💬 custom validation messages
    const messages: Record<string, string> = {
      required: 'This field is required.',
      minlength: `Minimum length is ${errors['minlength']?.requiredLength}.`,
      maxlength: `Maximum length is ${errors['maxlength']?.requiredLength}.`,
      email: 'Please enter a valid email address.',
      pattern: 'Invalid format.',
      min: `Value must be at least ${errors['min']?.min}.`,
      max: `Value must be less than or equal to ${errors['max']?.max}.`,
    };

    const firstKey = Object.keys(errors)[0];
    return messages[firstKey] ?? 'Invalid value.';
  });

  // CVA internal state
  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  // sync valueSig → control
  effect = effect(() => {
    const value = this.valueSig();
    if (this.control && this.control.value !== value) {
      this.control.setValue(value as T, { emitEvent: false });
    }
  });

  ngOnInit(): void {
    this.initFormControl();

    // 🔄 track both valueChanges and statusChanges to refresh errorsSig
    if (this.control) {
      merge(this.control.valueChanges, this.control.statusChanges)
        .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.errorsSig.set(this.control?.errors ?? null);
        });
    }
  }

  //#region CVA
  writeValue(value: T | null): void {
    this.valueSig.set(value);
  }

  registerOnChange(fn: (val: T | null) => void): void {
    this.onChange = fn;
    this.control?.valueChanges
      .pipe(
        startWith(this.control.value),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.valueSig.set(value);
        fn(value);
      });
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledSig.set(isDisabled);
  }
  //#endregion

  onBlur(): void {
    this.onTouched();
  }

  onInput(event: Event): void {
    if (this.disabledSig()) return;
    const value = (event.target as HTMLInputElement).value as unknown as T;
    this.valueSig.set(value);
    this.onChange(value);
    this.onTouched();
  }

  protected get controlName(): string | number | null {
    return this.ngControl instanceof FormControlName ? this.ngControl.name : null;
  }

  private initFormControl(): void {
    this.ngControl = this.injector.get(NgControl, undefined, { optional: true }) ?? undefined;

    if (this.ngControl instanceof FormControlName && this.formGroupDir) {
      this.control = this.formGroupDir.getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.control = this.ngControl.form as FormControl;
    } else {
      throw new Error('appControlValueAccessor: Unsupported control type');
    }
  }
}
