import { Component, Input, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { E_BUTTON_DEFAULT_OPTIONS } from '../../tokens/e-ui.tokens';

@Component({
  selector: 'e-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './e-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EButtonComponent {
  private defaults = inject(E_BUTTON_DEFAULT_OPTIONS);

  // forward host class to inner button
  @Input('class') hostClass = '';

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  // allow optional color input
  private colorSignal = signal<string | undefined>(undefined);
  @Input() set color(v: 'primary' | 'accent' | 'warn' | undefined) {
    this.colorSignal.set(v);
  }

  // disabled as a signal (input alias 'disabled')
  disabled = signal(false);
  @Input('disabled') set disabledInput(v: any) {
    this.disabled.set(!!v);
  }

  computedColor = computed(() => this.colorSignal() ?? this.defaults.color);

  // template helper
  computedColorFn = () => this.computedColor();
}
