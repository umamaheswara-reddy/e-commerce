import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ILoginFormGroup } from '../types/form.types';
import { UtilsService } from './utils.service';

export interface FormConfig {
  [key: string]: any[];
}

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private fb = inject(FormBuilder);
  private utils = inject(UtilsService);

  createFormGroup(config: FormConfig): FormGroup {
    return this.fb.group(config);
  }

  createFormArray(controls: AbstractControl[] = []): FormArray {
    return this.fb.array(controls);
  }

  createControl(
    value: any = null,
    validators: ValidatorFn[] = []
  ): AbstractControl {
    return this.fb.control(value, validators);
  }

  addControl(form: FormGroup, name: string, control: AbstractControl): void {
    form.addControl(name, control);
  }

  removeControl(form: FormGroup, name: string): void {
    form.removeControl(name);
  }

  getControl(
    form: FormGroup | FormArray,
    path: string | (string | number)[]
  ): AbstractControl | null {
    return form.get(path);
  }

  setValue(form: FormGroup, value: any): void {
    form.setValue(value);
  }

  patchValue(form: FormGroup, value: any): void {
    form.patchValue(value);
  }

  reset(form: FormGroup, value?: any): void {
    form.reset(value);
  }

  getFormErrors(form: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control && control.invalid && control.touched) {
        errors[key] = this.getFieldErrorMessage(key, control);
      }
    });

    return errors;
  }

  private getFieldErrorMessage(
    fieldName: string,
    control: AbstractControl
  ): string {
    if (control.errors?.['required']) {
      return `${this.formatFieldName(fieldName)} is required`;
    }

    if (control.errors?.['email']) {
      return 'Please enter a valid email';
    }

    if (control.errors?.['minlength']) {
      return `${this.formatFieldName(fieldName)} must be at least ${
        control.errors['minlength'].requiredLength
      } characters`;
    }

    if (control.errors?.['maxlength']) {
      return `${this.formatFieldName(fieldName)} must be at most ${
        control.errors['maxlength'].requiredLength
      } characters`;
    }

    if (control.errors?.['pattern']) {
      return `${this.formatFieldName(fieldName)} format is invalid`;
    }

    if (control.errors?.['mismatch']) {
      return 'Fields do not match';
    }

    if (control.errors?.['passwordStrength']) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }

    return 'Invalid value';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  markFormGroupUntouched(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      control?.markAsUntouched();
    });
  }

  markControlAsTouched(control: AbstractControl): void {
    control.markAsTouched();
  }

  markControlAsUntouched(control: AbstractControl): void {
    control.markAsUntouched();
  }

  isFormValid(form: FormGroup): boolean {
    return form.valid;
  }

  isFormDirty(form: FormGroup): boolean {
    return form.dirty;
  }

  isFormTouched(form: FormGroup): boolean {
    return form.touched;
  }

  isControlValid(control: AbstractControl): boolean {
    return control.valid;
  }

  isControlDirty(control: AbstractControl): boolean {
    return control.dirty;
  }

  isControlTouched(control: AbstractControl): boolean {
    return control.touched;
  }

  getFormValue(form: FormGroup): any {
    return form.value;
  }

  getRawFormValue(form: FormGroup): any {
    return form.getRawValue();
  }

  getControlValue(form: FormGroup, path: string): any {
    const control = form.get(path);
    return control ? control.value : null;
  }

  setControlValue(form: FormGroup, path: string, value: any): void {
    const control = form.get(path);
    control?.setValue(value);
  }

  // Custom validators
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = this.utils.isValidEmail(control.value);
      return valid ? null : { email: { value: control.value } };
    };
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!this.utils.exists(value)) return null;

      const valid = this.utils.isValidPassword(value);
      return valid ? null : { passwordStrength: true };
    };
  }

  matchingFieldsValidator(field1: string, field2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control1 = formGroup.get(field1);
      const control2 = formGroup.get(field2);

      if (!control1 || !control2) return null;

      if (control1.value !== control2.value) {
        control2.setErrors({ ...control2.errors, mismatch: true });
        return { mismatch: true };
      } else {
        const errors = { ...control2.errors };
        delete errors['mismatch'];
        control2.setErrors(Object.keys(errors).length ? errors : null);
        return null;
      }
    };
  }

  minLengthValidator(minLength: number): ValidatorFn {
    return Validators.minLength(minLength);
  }

  maxLengthValidator(maxLength: number): ValidatorFn {
    return Validators.maxLength(maxLength);
  }

  patternValidator(pattern: string | RegExp): ValidatorFn {
    return Validators.pattern(pattern);
  }

  requiredValidator(): ValidatorFn {
    return Validators.required;
  }

  composeValidators(validators: ValidatorFn[]): ValidatorFn {
    return Validators.compose(validators) || (() => null);
  }

  // Specific form creators
  createLoginForm(): ILoginFormGroup {
    return new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(6)],
        nonNullable: true,
      }),
    });
  }
}
