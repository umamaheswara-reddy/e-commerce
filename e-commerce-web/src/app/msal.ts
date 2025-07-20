import { LogLevel, Configuration, BrowserCacheLocation, PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

// This function will be used to check if the code is running in a browser environment.
export function isBrowser(platformId: Object): boolean {
  return isPlatformBrowser(platformId);
}

const isIE = (platformId: Object) => isBrowser(platformId) && (window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1);

export function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalInstance(PLATFORM_ID));
}

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
function msalInstance(platformId: Object): Configuration {
  return {
      auth: {
          clientId: '324dfba7-14a4-4e2f-9042-2c8043ca8b97', // This is the ONLY mandatory field that you need to supply.
          authority: 'https://eadashopperstop.ciamlogin.com/fe9de334-4bcc-4e34-96e2-83ed4683a38e/v2.0', // Defaults to "https://login.microsoftonline.com/common"
          redirectUri: 'https://localhost:4200/cart', // Points to window.location.origin. You must register this URI on Azure portal/App Registration.
          postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
          navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
      },
      cache: {
          cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
          storeAuthStateInCookie: isIE(platformId), // Set this to "true" if you are having issues on IE11 or Edge
      },
      system: {
          loggerOptions: {
              loggerCallback(logLevel: LogLevel, message: string) {
                  console.log(message);
              },
              logLevel: LogLevel.Verbose,
              piiLoggingEnabled: false
          }
      }
  };
}

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: ['openid', 'offline_access', 'email']
};
