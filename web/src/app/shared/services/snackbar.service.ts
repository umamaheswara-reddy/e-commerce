import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(private snackbar: MatSnackBar) {}

  success(message: string, duration = 3000) {
    this.snackbar.open(message, 'Close', { duration, panelClass: ['snackbar-success'] });
  }

  error(message: string, duration = 5000) {
    this.snackbar.open(message, 'Close', { duration, panelClass: ['snackbar-error'] });
  }
}
