import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
    { path: '', component: WelcomeComponent, pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./welcome/welcome.component').then(m => m.WelcomeComponent) },
];
