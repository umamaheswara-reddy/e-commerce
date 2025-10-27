import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { E_INPUT_DEFAULT_OPTIONS, EInputOptions } from '../tokens/e-ui.tokens';

export const provideMaterialInputBridge = {
  provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
  useFactory: (opts: EInputOptions) => ({
    appearance: opts.appearance,
    floatLabel: opts.floatLabel,
  }),
  deps: [E_INPUT_DEFAULT_OPTIONS],
};
