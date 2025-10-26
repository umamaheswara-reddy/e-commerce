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
  private readonly errorMappings: Record<string, IError> = {
    INVALID_CREDENTIALS: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      userMessage:
        'The email or password you entered is incorrect. Please try again.',
    },
    USER_NOT_FOUND: {
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      userMessage: 'No account found with this email address.',
    },
    ACCOUNT_LOCKED: {
      code: 'ACCOUNT_LOCKED',
      message: 'Account is locked',
      userMessage:
        'Your account has been temporarily locked due to multiple failed login attempts. Please try again later or reset your password.',
    },
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      userMessage:
        'Unable to connect to the server. Please check your internet connection and try again.',
    },
    SERVER_ERROR: {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      userMessage: 'Something went wrong on our end. Please try again later.',
    },
    UNKNOWN_ERROR: {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again.',
    },
  };

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
