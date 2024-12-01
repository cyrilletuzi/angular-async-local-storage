import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideIndexedDBDataBaseName, provideIndexedDBStoreName, provideLocalStoragePrefix } from "@ngx-pwa/local-storage";
import { AppComponent } from "./app/app.component";
import { HomeComponent } from "./app/home/home.component";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      { path: "lazy", loadChildren: () => import("./app/lazy/routes").then(m => m.routes) },
      { path: "", component: HomeComponent, pathMatch: "full" },
    ]),
    provideLocalStoragePrefix("localforage/"),
    provideIndexedDBDataBaseName("localforage"),
    provideIndexedDBStoreName("keyvaluepairs"),
  ],
})
  .then(() => {
    // Nothing to do
  }, (err) => {
    console.error(err);
  });
