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
  private readonly injector = inject(Injector);

  protected control?: FormControl<T>;
  protected ngControl: NgControl | undefined;

  // reactive signals
  protected readonly valueSig = signal<T | null>(null);
  protected readonly disabledSig = signal(false);
  protected readonly requiredSig = signal(false);

  // computed derived signals
  readonly showError = computed(() => {
    const control = this.control;
    return !!(control && control.invalid && (control.dirty || control.touched));
  });

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  // sync internal signal → form
  effect = effect(() => {
    const value = this.valueSig();
    if (this.control && this.control.value !== value) {
      this.control.setValue(value as T, { emitEvent: false });
    }
  });

  ngOnInit(): void {
    this.initFormControl();
    this.requiredSig.set(this.control?.hasValidator(Validators.required) ?? false);
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
    // 👇 inject NgControl lazily to avoid circular dependency
    this.ngControl = this.injector.get(NgControl, undefined, { optional: true })?? undefined;
    if (this.ngControl instanceof FormControlName && this.formGroupDir) {
      this.control = this.formGroupDir.getControl(this.ngControl);
    } else if (this.ngControl instanceof FormControlDirective) {
      this.control = this.ngControl.form as FormControl;
    } else {
      throw new Error('appControlValueAccessor: Unsupported control type');
    }
  }
}
