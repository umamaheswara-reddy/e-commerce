import {
  Directive,
  computed,
  DestroyRef,
  inject,
  OnInit,
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
  selector: '[appControlValueAccessor]'
})
export class ControlValueAccessorDirective<T>
  implements ControlValueAccessor, OnInit {

  private readonly formGroupDir = inject(FormGroupDirective, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
    
  protected readonly ngControl = inject(NgControl, { optional: true });
  protected control?: FormControl;
  protected value: T | null = null;
  isRequired = false;
  isDisabled = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  controlSig = computed(() => this.control);

  ngOnInit(): void {
    this.setFormControl();
    this.isRequired = this.controlSig()?.hasValidator(Validators.required) ?? false;
  }

  private setFormControl() {
    try {
      if (this.ngControl instanceof FormControlName && this.formGroupDir) {
        this.control = this.formGroupDir.getControl(this.ngControl);
      } else if (this.ngControl instanceof FormControlDirective) {
        this.control = this.ngControl.form as FormControl;
      }
    } catch {}
  }

  writeValue(value: T): void {
    this.value = value;
  }

  registerOnChange(fn: (val: T | null) => void): void {
    this.controlSig()?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(this.control?.value),
        distinctUntilChanged(),
        tap((val: T) => fn(val))
      )
      .subscribe(() => this.controlSig()?.markAsUntouched());
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onBlur() {
    this.onTouched();
  }

  onInput(event: Event) {
    if (this.isDisabled) return;
    this.value = (event.target as HTMLInputElement).value as unknown as T;
    this.onChange(this.value);
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  showError = computed(() => {
    const control = this.control;
    return !!(control && control.invalid && (control.dirty || control.touched));
  });
}
