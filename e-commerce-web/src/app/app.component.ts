import { Component, inject, OnInit } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventType, AuthenticationResult } from '@azure/msal-browser';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);

  loggedIn = false;
  username = '';

  async ngOnInit(): Promise<void> {

    try {
      // ✅ Wait until MSAL is initialized before calling handleRedirectPromise
      await this.msalService.instance.initialize();

      const result = await this.msalService.instance.handleRedirectPromise();
      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
      }
    } catch (err) {
      console.error("❌ Redirect handling failed:", err);
    }

    // 2. Subscribe to MSAL broadcast events to update user info
    this.msalBroadcastService.msalSubject$.subscribe((msg) => {
      if (msg.eventType === EventType.LOGIN_SUCCESS && msg.payload) {
        const authResult = msg.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(authResult.account);
        this.setUserInfo();
      }
    });

    const account = this.msalService.instance.getActiveAccount();
    if (account) this.setUserInfo();
  }

  setUserInfo() {
    const account = this.msalService.instance.getActiveAccount();
    this.loggedIn = !!account;
    this.username = account?.username || '';
  }

  login() {
    this.msalService.loginRedirect();
  }

  logout() {
    this.msalService.logoutRedirect();
  }
}
