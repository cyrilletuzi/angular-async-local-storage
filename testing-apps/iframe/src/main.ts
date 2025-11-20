import { provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection(),
  ]
})
  .catch((err) => {
    console.log(err);
  });
