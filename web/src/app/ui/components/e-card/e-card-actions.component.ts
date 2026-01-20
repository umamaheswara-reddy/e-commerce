import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'e-card-actions',
  standalone: true,
  template: `
    <hr class="e-card-actions__separator" />
    <div class="e-card-actions__content d-flex justify-between">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
    }

    .e-card-actions__separator {
      width: 100%;
      border: none;
      border-top: 1px solid var(--mat-divider-color, rgba(0, 0, 0, 0.12));
    }

    .e-card-actions__content {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardActionsComponent {}
