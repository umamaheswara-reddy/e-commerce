import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenUtils {
  static parseToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const parsed = this.parseToken(token);
    if (!parsed || !parsed.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return parsed.exp < currentTime;
  }

  static getTokenExpiry(token: string): Date | null {
    const parsed = this.parseToken(token);
    if (!parsed || !parsed.exp) {
      return null;
    }
    return new Date(parsed.exp * 1000);
  }
}
