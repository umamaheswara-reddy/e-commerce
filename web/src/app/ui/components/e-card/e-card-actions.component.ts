import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'e-card-actions',
  standalone: true,
  template: `<mat-card-actions><ng-content></ng-content></mat-card-actions>`,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardActionsComponent {}
