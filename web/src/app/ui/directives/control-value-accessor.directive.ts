import { computed, DestroyRef, Directive, Inject, Injector, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroupDirective, NgControl, Validators } from '@angular/forms';
import { startWith, distinctUntilChanged, tap } from 'rxjs';

@Directive({
  selector: '[appControlValueAccessor]'
})
export class ControlValueAccessorDirective<T> implements ControlValueAccessor, OnInit {

  private control?: FormControl | undefined;
  isRequired = false;
  isDisabled: boolean = false;
  protected value: T | null = null;

  // Callback functions
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // computed form control
  controlSig = computed(() => this.control);

  constructor(@Inject(Injector) private injector: Injector) {}

  ngOnInit(): void {
    this.setFormControl();
    this.isRequired = this.controlSig()?.hasValidator(Validators.required) ?? false;
  }

  private setFormControl() {
    const formControl = this.injector.get(NgControl);
    try {
      switch (formControl.constructor) {
        case FormControlName: {
          this.control = this.injector.get(FormGroupDirective).getControl(formControl as FormControlName);
          break;
        }
        default:
          this.control = (formControl as FormControlDirective).form as FormControl;
      }
    }
    catch { }
  }

  writeValue(value: T): void {
    this.value = value;
  }

  registerOnChange(fn: (val: T | null) => T): void {
    this.controlSig()?.valueChanges
      .pipe(takeUntilDestroyed(this.injector.get(DestroyRef)),
        startWith(this.control?.value),
        distinctUntilChanged(),
        tap((val: T)=> fn(val))
      ).subscribe(() => this.controlSig()?.markAsUntouched());
    this.onChange = fn;
  }

  registerOnTouched(fn: () => T): void {
    this.onTouched = fn;
  }

  onBlur() {
    this.onTouched();
    console.log('blurred');
  }

  onInput(event: Event) {
    if(this.isDisabled)
      return;
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
