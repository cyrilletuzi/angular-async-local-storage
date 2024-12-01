import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent)
  .then(() => {
    // Nothing to do
  }, (err) => {
    console.error(err);
  });
