// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withFetch,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalModule,
  MsalRedirectComponent,
  MsalService,
} from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { msalInstanceFactory } from './msal';
import { routes } from './app.routes';

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(routes),
    importProvidersFrom(MsalModule),
    importProvidersFrom(MsalRedirectComponent),
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        authRequest: { scopes: ['openid', 'profile', 'email'] },
      },
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['https://graph.microsoft.com/v1.0/me', ['User.Read']],
        ]),
      },
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
};
