import { provideBrowserGlobalErrorListeners } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideIndexedDBDataBaseName, provideIndexedDBStoreName, provideLocalStoragePrefix } from "@ngx-pwa/local-storage";
import { App } from "./app/app";
import { Home } from "./app/home/home";

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter([
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      { path: "lazy", loadChildren: () => import("./app/lazy/routes").then(m => m.routes) },
      { path: "", component: Home, pathMatch: "full" },
    ]),
    provideLocalStoragePrefix("localforage/"),
    provideIndexedDBDataBaseName("localforage"),
    provideIndexedDBStoreName("keyvaluepairs"),
  ],
})
  .catch((err) => {
    console.error(err);
  });
