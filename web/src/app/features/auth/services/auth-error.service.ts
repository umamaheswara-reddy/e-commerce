import { Injectable } from '@angular/core';

export interface IAuthError {
  code: string;
  message: string;
  userMessage: string;
}

export interface IAuthErrorService {
  getUserFriendlyMessage(error: any): string;
  mapBackendError(error: any): IAuthError;
}

@Injectable({
  providedIn: 'root',
})
export class AuthErrorService implements IAuthErrorService {
  private readonly errorMappings: Record<string, IAuthError> = {
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

  getUserFriendlyMessage(error: any): string {
    const authError = this.mapBackendError(error);
    return authError.userMessage;
  }

  mapBackendError(error: any): IAuthError {
    // Handle HTTP errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          return this.errorMappings['INVALID_CREDENTIALS'];
        case 404:
          return this.errorMappings['USER_NOT_FOUND'];
        case 423: // Locked
          return this.errorMappings['ACCOUNT_LOCKED'];
        case 500:
        case 502:
        case 503:
          return this.errorMappings['SERVER_ERROR'];
        default:
          return this.errorMappings['UNKNOWN_ERROR'];
      }
    }

    // Handle specific error codes from backend
    if (error?.error?.code) {
      const errorCode = error.error.code;
      return (
        this.errorMappings[errorCode] || this.errorMappings['UNKNOWN_ERROR']
      );
    }

    // Handle network errors
    if (error?.name === 'HttpErrorResponse' && !error.status) {
      return this.errorMappings['NETWORK_ERROR'];
    }

    // Default fallback
    return this.errorMappings['UNKNOWN_ERROR'];
  }
}
