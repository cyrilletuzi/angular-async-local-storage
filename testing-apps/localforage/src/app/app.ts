import { Component, inject, signal, type OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StorageMap } from "@ngx-pwa/local-storage";
import * as localForage from "localforage";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
  ],
  template: `
    @if (title()) {
      <h1>{{ title() }}</h1>
    }
    <router-outlet />
  `
})
export class App implements OnInit {

  private readonly storageMap = inject(StorageMap);
  title = signal<string | undefined>(undefined);

  ngOnInit(): void {

    const key = "key";
    const value = "hello world";

    localForage.setItem(key, value).then(() => {

      this.storageMap.get(key, { type: "string" }).subscribe((result) => {
        if (result !== undefined) {
          this.title.set(result);
        }
      });

    }).catch(() => {});

  }

}
