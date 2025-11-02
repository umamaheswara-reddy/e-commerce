import {
  Component,
  Input,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

type CardVariant = 'elevated' | 'outlined' | 'flat';

@Component({
  selector: 'e-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [ngClass]="[variantClass(), hostClass()]" class="e-card">
      <!-- Header -->
      <mat-card-header *ngIf="hasHeader()">
        <mat-card-title *ngIf="title()">{{ title() }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle()">{{ subtitle() }}</mat-card-subtitle>
        <ng-content select="[card-header]"></ng-content>
      </mat-card-header>

      <!-- Content -->
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>

      <!-- Actions -->
      <mat-card-actions>
        <ng-content select="[card-actions]"></ng-content>
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
  variant = input<CardVariant>('elevated');

  // Derived
  variantClass = computed(() => {
    switch (this.variant()) {
      case 'outlined': return 'mat-card-outlined';
      case 'flat': return 'mat-card-flat';
      default: return 'mat-card-elevated';
    }
  });

  hasHeader = computed(() => !!(this.title() || this.subtitle()));

}
