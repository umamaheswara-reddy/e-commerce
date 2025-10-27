import { InjectionToken } from '@angular/core';

export interface EButtonOptions {
  color: 'primary' | 'accent' | 'warn';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  disabled?: boolean;
}

export const E_BUTTON_DEFAULT_OPTIONS = new InjectionToken<EButtonOptions>(
  'E_BUTTON_DEFAULT_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      color: 'primary',
      size: 'md',
      rounded: false,
      disabled: false,
    }),
  }
);

export interface EInputOptions {
  appearance: 'outline' | 'fill';
  floatLabel: 'always' | 'auto';
}

export const E_INPUT_DEFAULT_OPTIONS = new InjectionToken<EInputOptions>(
  'E_INPUT_DEFAULT_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      appearance: 'outline',
      floatLabel: 'auto',
    }),
  }
);
