import {
  Component,
  ChangeDetectionStrategy,
  Input,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { E_BUTTON_DEFAULT_OPTIONS } from '../../tokens/e-ui.tokens';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonColor = 'primary' | 'accent' | 'warn' | undefined;
type ButtonVariant = 'flat' | 'raised' | 'stroked' | 'icon' | 'fab' | 'mini-fab';

@Component({
  selector: 'e-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button
      matButton
      [attr.type]="type()"
      [color]="computedColor()"
      [disabled]="disabled() || loading()"
      [ngClass]="[variantClass(), hostClass()]"
      class="e-btn"
    >
      <ng-container *ngIf="loading(); else content">
        <mat-icon class="spin">refresh</mat-icon>
        <span class="ml-2">{{ loadingText() }}</span>
      </ng-container>

      <ng-template #content>
        <ng-content></ng-content>
      </ng-template>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private defaults = inject(E_BUTTON_DEFAULT_OPTIONS);

  // ---- Inputs ----
  type = input<ButtonType>('button');
  color = input<ButtonColor>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  variant = input<ButtonVariant>('raised');
  loadingText = input<string>('Loading...');
  hostClass = input<string>('');

  // ---- Computed ----
  computedColor = computed(() => this.color() ?? this.defaults.color);
  variantClass = computed(() => {
    const v = this.variant();
    switch (v) {
      case 'raised': return 'mat-raised-button';
      case 'stroked': return 'mat-stroked-button';
      case 'icon': return 'mat-icon-button';
      case 'fab': return 'mat-fab';
      case 'mini-fab': return 'mat-mini-fab';
      default: return 'mat-flat-button';
    }
  });
}
