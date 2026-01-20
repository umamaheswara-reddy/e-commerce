import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  // Email validation regex
  private readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * Validates if the provided email string matches a valid email pattern
   * @param email - The email string to validate
   * @returns boolean indicating if the email is valid
   */
  isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  /**
   * Validates password strength requirements:
   * - At least 6 characters
   * - Contains uppercase letter
   * - Contains numeric digit
   * - Contains non-alphanumeric character
   * @param password - The password string to validate
   * @returns boolean indicating if the password meets strength requirements
   */
  isValidPassword(password: string): boolean {
    if (!password) return false;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(password);
    const isValidLength = password.length >= 6;

    return hasUpperCase && hasNumeric && hasNonAlphanumeric && isValidLength;
  }

  /**
   * Checks if a value exists (not null, not undefined, and not empty)
   * @param value - The value to check
   * @returns boolean indicating if the value exists and is not empty
   */
  exists(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }
}
