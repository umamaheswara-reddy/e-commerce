import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface IError {
  code: string;
  message: string;
  userMessage: string;
}

export interface IErrorService {
  getUserFriendlyMessage(error: any): string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements IErrorService {
  getUserFriendlyMessage(error: HttpErrorResponse): string {
    if (!navigator.onLine) return 'You are offline. Check your internet connection.';
    switch (error.status) {
      case 0:
        return 'Cannot connect to the server.';
      case 400:
        return error.error?.message || 'Invalid request data.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Requested resource not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      default:
        return error.error?.message || 'An unexpected error occurred.';
    }
  }
}
