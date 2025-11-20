import { provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection(),
  ]
})
  .then(() => {
    // Nothing to do
  }, (err) => {
    console.error(err);
  });
