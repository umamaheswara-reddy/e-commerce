import { FormControl, FormGroup } from '@angular/forms';

// Form control interfaces
export interface ILoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

// Form group interfaces
export interface ILoginFormGroup extends FormGroup<ILoginFormControls> {}

// Data interfaces (for form values)
export interface ILoginFormData {
  email: string;
  password: string;
}

// You can add more form types here as the app grows
// export interface IRegisterFormControls { ... }
// export interface IUserProfileFormControls { ... }
// etc.
