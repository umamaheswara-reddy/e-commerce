import { Injectable } from '@angular/core';

export interface ILoggerService {
  error(message: string, error?: any): void;
  warn(message: string, data?: any): void;
  info(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService implements ILoggerService {
  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
    // In production, you might want to send this to a logging service
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
  }

  info(message: string, data?: any): void {
    console.info(`[INFO] ${message}`, data);
  }

  debug(message: string, data?: any): void {
    console.debug(`[DEBUG] ${message}`, data);
  }
}
