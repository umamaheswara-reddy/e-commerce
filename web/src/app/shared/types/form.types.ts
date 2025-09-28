import { FormControl, FormGroup } from '@angular/forms';

// Form control interfaces
export interface ILoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

export interface IRegisterFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  role: FormControl<string>;
}

// Form group interfaces
export interface ILoginFormGroup extends FormGroup<ILoginFormControls> {}
export interface IRegisterFormGroup extends FormGroup<IRegisterFormControls> {}

// Data interfaces (for form values)
export interface ILoginFormData {
  email: string;
  password: string;
}

export interface IRegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

// You can add more form types here as the app grows
// export interface IUserProfileFormControls { ... }
// etc.
