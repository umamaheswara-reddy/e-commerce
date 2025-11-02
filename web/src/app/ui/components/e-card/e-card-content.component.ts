import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'e-card-content',
  standalone: true,
  template: `<mat-card-content><ng-content></ng-content></mat-card-content>`,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContentComponent {}
