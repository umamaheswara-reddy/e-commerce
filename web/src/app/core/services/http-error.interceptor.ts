import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { LoggerService } from '../../shared/services/logger.service';
import { ErrorService } from '../../shared/services/error.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private errorService: ErrorService,
    private snackbar: SnackbarService,
    private logger: LoggerService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = this.errorService.getUserFriendlyMessage(error);

        // Optionally skip snackbar for certain API calls
        if (!req.headers.has('X-Silent')) {
          this.snackbar.error(message);
        }

        this.logger.error('HTTP Error', { url: req.url, status: error.status, message });
        return throwError(() => error);
      })
    );
  }
}
