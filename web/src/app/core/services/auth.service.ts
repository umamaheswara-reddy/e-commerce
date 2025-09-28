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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  userId?: string;
  token?: string;
  message?: string;
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
  private readonly API_BASE_URL = 'http://localhost:9003/api/auth';
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

  login(email: string, password: string): Observable<IAuthResult> {
    // For now, using mock authentication
    // In a real app, this would make an HTTP call to your backend
    return this.mockLogin(email, password);
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
        }),
        catchError((error) => {
          // Handle error
          return of({
            success: false,
            message: error.error?.message || 'Registration failed',
          });
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

  private mockLogin(email: string, password: string): Observable<IAuthResult> {
    // Simple mock authentication
    // In production, replace with actual authentication logic
    const mockUsers = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'user@example.com',
        password: 'user123',
        name: 'Regular User',
        role: 'user',
      },
    ];

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const token = 'mock-jwt-token-' + Date.now();
      this.setSession(userData, token);
      return of({ success: true });
    }

    return of({ success: false, message: 'Invalid email or password' });
  }

  private mockRegister(userData: {
    email: string;
    password: string;
    name: string;
  }): Observable<AuthResponse> {
    // Mock successful registration
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      name: userData.name,
      role: 'user',
    };

    const token = 'mock-jwt-token-' + Date.now();
    this.setSession(newUser, token);

    return of({
      success: true,
      user: newUser,
      token,
      message: 'Registration successful',
    });
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
      // In a real app, you'd validate the token's expiration
      return !!token;
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
