import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'e-card-content',
  standalone: true,
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContentComponent {}
