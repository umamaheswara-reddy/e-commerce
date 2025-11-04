import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
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
      [matButton]="appearance()"
      [attr.type]="type()"
      [color]="computedColor()"
      [disabled]="disabled() || loading()"
      [class]="hostClass()"
      [ngClass]="variantDirective()"
    >
      <ng-container *ngIf="loading(); else normalContent">
        <mat-icon class="spin">refresh</mat-icon>
        <span class="ml-2">{{ loadingText() }}</span>
      </ng-container>

      <ng-template #normalContent>
        <ng-content></ng-content>
      </ng-template>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private defaults = inject(E_BUTTON_DEFAULT_OPTIONS);

  // Inputs
  type = input<ButtonType>('button');
  color = input<ButtonColor>('primary');
  variant = input<ButtonVariant>('raised');
  appearance = input<MatButtonAppearance>('filled');
  disabled = input(false);
  loading = input(false);
  loadingText = input('Loading...');
  hostClass = input('');

  // Computed
  computedColor = computed(() => this.color() ?? this.defaults.color);

  variantDirective = computed(() => {
    switch (this.variant()) {
      case 'raised': return 'mat-raised-button';
      case 'stroked': return 'mat-stroked-button';
      case 'flat': return 'mat-flat-button';
      case 'icon': return 'mat-icon-button';
      case 'fab': return 'mat-fab';
      case 'mini-fab': return 'mat-mini-fab';
      default: return 'mat-flat-button';
    }
  });
}
