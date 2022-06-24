import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

export function getBaseUrl() {
  return"http://127.0.0.1:8000/";
}

export function getBaseApiUrl() {
  return getBaseUrl() + "api";
}

const providers = [
  { provide: "BASE_URL", useFactory: getBaseUrl, deps: [] },
  { provide: "BASE_API_URL", useFactory: getBaseApiUrl, deps: [] },
];

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.error(err));
