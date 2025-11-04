import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'e-card-content',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`:host { display: flex; gap:1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContentComponent {}
