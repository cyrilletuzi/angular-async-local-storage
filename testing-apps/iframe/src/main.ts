import { provideBrowserGlobalErrorListeners } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
  ]
})
  .catch((err) => {
    console.log(err);
  });
