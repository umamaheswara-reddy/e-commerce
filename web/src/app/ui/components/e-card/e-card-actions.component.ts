import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'e-card-actions',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardActionsComponent {}
