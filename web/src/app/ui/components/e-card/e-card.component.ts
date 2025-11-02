import { Component, Input, ChangeDetectionStrategy, signal, computed, input, ContentChild, ElementRef, ContentChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

type CardVariant = 'elevated' | 'outlined' | 'flat';

@Component({
  selector: 'e-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [ngClass]="[variantClass(), hostClass]" class="e-card">
      <mat-card-header *ngIf="hasHeader()">
        <mat-card-title *ngIf="title()">{{ title() }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle()">{{ subtitle() }}</mat-card-subtitle>
        <ng-content select="[card-header]"></ng-content>
      </mat-card-header>

      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>

      <mat-card-actions *ngIf="hasActions()">
        <ng-content select="[card-actions]"></ng-content>
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CardComponent {
  // Inputs
  @Input('class') hostClass = '';
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

  // Helpers for content detection
  hasHeader = computed(() => !!(this.title() || this.subtitle()));

  // ✅ Detect all elements with [card-actions]
  @ContentChildren('[card-actions]', { descendants: true, read: ElementRef })
  actionsContent!: QueryList<ElementRef>;

  private hasActionsSig = signal(false);
  hasActions = computed(() => this.hasActionsSig());

  ngAfterContentInit(): void {
    // Set once and also watch for changes
    const update = () => this.hasActionsSig.set(this.actionsContent.length > 0);
    update();
    this.actionsContent.changes.subscribe(update);
  }
}
