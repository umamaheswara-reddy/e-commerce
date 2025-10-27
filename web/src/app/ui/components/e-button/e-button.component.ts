import { Component, Input, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { E_BUTTON_DEFAULT_OPTIONS, EButtonOptions } from '../../tokens/e-ui.tokens';

@Component({
  selector: 'e-button',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <button mat-raised-button
            [color]="options().color"
            [disabled]="isDisabled()">
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EButtonComponent {
  private defaults = inject(E_BUTTON_DEFAULT_OPTIONS);
  options = signal<EButtonOptions>(this.defaults);
  isDisabled = signal(false);

  @Input() set disabled(value: boolean) {
    this.isDisabled.set(!!value);
  }
}
