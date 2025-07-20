import { bootstrapApplication } from '@angular/platform-browser';
import { APP_CONFIG } from './app/app.config';
import { AppComponent } from './app/app.component';
import { msalInstanceFactory } from './app/msal';

const bootstrap = async () =>{
  const msal = msalInstanceFactory();

  // 🔐 Ensure MSAL is initialized before app uses it
  await msal.initialize();

  await bootstrapApplication(AppComponent, APP_CONFIG)
};

bootstrap().catch((err) => console.error(err));
