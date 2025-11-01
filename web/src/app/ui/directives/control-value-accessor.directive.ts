import {
  Directive,
  DestroyRef,
  OnInit,
  inject,
  computed,
  signal,
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
import { distinctUntilChanged, startWith } from 'rxjs';

@Directive({
  selector: '[appControlValueAccessor]',
})
export class ControlValueAccessorDirective<T>
  implements ControlValueAccessor, OnInit {

  private readonly formGroupDir = inject(FormGroupDirective, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  protected readonly ngControl = inject(NgControl, { optional: true });

  // reactive signals
  protected readonly valueSig = signal<T | null>(null);
  protected readonly disabledSig = signal(false);
  protected readonly requiredSig = signal(false);

  protected control?: FormControl<T>;

  // computed derived signals
  readonly showError = computed(() => {
    const control = this.control;
    return !!(control && control.invalid && (control.dirty || control.touched));
  });

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.initFormControl();
    this.requiredSig.set(this.control?.hasValidator(Validators.required) ?? false);

    // sync internal signal → form
    effect(() => {
      const value = this.valueSig();
      if (this.control && this.control.value !== value) {
        this.control.setValue(value as T, { emitEvent: false });
      }
    });
  }

  //#region CVA methods
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
      .subscribe(value => {
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

  //#region UI event handlers
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
  //#endregion

  //#region Protected getters

  /** Expose control name (works for FormControlName only) */
  protected get controlName(): string | number | null {
    console.log(this.ngControl);
    return this.ngControl instanceof FormControlName ? this.ngControl.name : null;
  }

  //#endregion

  //#region private methods
  private initFormControl(): void {
    if (this.ngControl instanceof FormControlName && this.formGroupDir) {
      this.control = this.formGroupDir.getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.control = this.ngControl.form as FormControl<T>;
    } else {
      throw new Error('appControlValueAccessor: No valid NgControl found');
    }
  }
  //#endregion
}
