import { Routes } from '@angular/router';
import { WelcomeComponent } from './features/welcome/welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/welcome/welcome.component').then(
        (m) => m.WelcomeComponent
      ),
  },
];
