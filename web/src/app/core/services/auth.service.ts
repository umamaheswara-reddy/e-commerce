import {
  Injectable,
  Inject,
  PLATFORM_ID,
  signal,
  computed,
} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TokenUtils } from '../../utils/token.utils';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  userId?: string;
  token?: string;
  message?: string;
  errors?: string;
  tenantId?: string;
}

export interface IAuthResult {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_BASE_URL = environment.apiUrl + '/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  // Using Angular signals instead of BehaviorSubject
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  private isAuthenticatedSignal = signal<boolean>(this.hasValidToken());

  // Computed signals for reactive access
  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticated = computed(() => this.isAuthenticatedSignal());

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/login`, { email, password }).pipe(
      map((response) => {
        if (response.success && response.token) {
          this.setSession(
            {
              id: response.userId?.toString() ?? '',
              email,
              name: response.user.name,
              role: response.user.role ?? 'user',
            },
            response.token
          );
        }
        return { success: response.success, message: response.message } as IAuthResult;
      })
    );
  }

  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
  }): Observable<AuthResponse> {
    // Call actual API
    return this.http
      .post<AuthResponse>(`${this.API_BASE_URL}/register`, userData)
      .pipe(
        map((response) => {
          if (response.success && response.token) {
            this.setSession(
              {
                id: response.userId?.toString() || '',
                email: userData.email,
                name: `${userData.firstName} ${userData.lastName}`,
                role: 'user',
              },
              response.token
            );
          }
          return response;
        })        
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  forgotPassword(
    email: string
  ): Observable<{ success: boolean; message: string }> {
    // Mock forgot password - replace with actual API call
    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.API_BASE_URL}/forgot-password`,
        { email }
      )
      .pipe(
        catchError(() => {
          // Fallback to mock if API not available
          return of({
            success: true,
            message: 'Password reset email sent successfully',
          });
        })
      );
  }

  resetPassword(
    token: string,
    newPassword: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.API_BASE_URL}/reset-password`,
        {
          token,
          newPassword,
        }
      )
      .pipe(
        catchError(() => {
          return of({ success: true, message: 'Password reset successfully' });
        })
      );
  }

  private setSession(user: User, token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private hasValidToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return false;
      return !TokenUtils.isTokenExpired(token);
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
}
