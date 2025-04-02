import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';

export const routes: Routes = [
    {path: '', redirectTo: 'checkout', pathMatch: 'full'},
    {path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)}
];
