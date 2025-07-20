import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'cart', pathMatch: 'full'},
    {path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)}
];
