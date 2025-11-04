import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardAppearance, MatCardModule } from '@angular/material/card';

@Component({
  selector: 'e-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [appearance]="appearance()">
      <!-- Header -->
      <mat-card-header>
          @if (title()) {
            <mat-card-title>{{ title() }}</mat-card-title>
          }
          @if (subtitle()) {
            <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
          }
          <ng-content select="e-card-header"></ng-content>
        </mat-card-header>

      <!-- content -->
      <mat-card-content>
          <ng-content select="e-card-content"></ng-content>
      </mat-card-content>
      
      <!-- actions -->
      <mat-card-actions>
        <ng-content select="e-card-actions"></ng-content>
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  // Inputs
  hostClass = input<string>('');
  title = input<string>('');
  subtitle = input<string>('');
  appearance = input<MatCardAppearance>('outlined');

  hasHeader = computed(() => !!(this.title() || this.subtitle()));
}
