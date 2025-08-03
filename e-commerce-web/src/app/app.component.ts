import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventType, AuthenticationResult } from '@azure/msal-browser';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from './features/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatButtonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);

  private account = signal(this.msalService.instance.getActiveAccount());
  readonly loggedIn = computed(() => !!this.account());
  readonly username = computed(() => this.account()?.username ?? '');

  constructor() {
    this.initAuth();
    this.setupBroadcastListener();
  }

  private async initAuth() {
    try {
      await this.msalService.instance.initialize();
      const result = await this.msalService.instance.handleRedirectPromise();
      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
        this.account.set(result.account);
      }
    } catch (err) {
      console.error('❌ Redirect handling failed:', err);
    }
  }

  private setupBroadcastListener() {
    this.msalBroadcastService.msalSubject$.subscribe((msg) => {
      if (msg.eventType === EventType.LOGIN_SUCCESS && msg.payload) {
        const authResult = msg.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(authResult.account);
        this.account.set(authResult.account);
      }
    });
  }

  login() {
    this.msalService.loginRedirect();
  }

  logout() {
    this.msalService.logoutRedirect();
  }
}
