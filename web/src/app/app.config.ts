// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withFetch,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { provideMaterialInputBridge } from './ui/bridges/material.bridge';

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter(routes),
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } },
    provideMaterialInputBridge,
  ],
};
