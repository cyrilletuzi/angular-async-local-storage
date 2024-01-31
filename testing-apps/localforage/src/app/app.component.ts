import { Component, type OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { StorageMap } from "@ngx-pwa/local-storage";
import * as localForage from "localforage";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  template: `
    @if (title) {
      <h1>{{ title }}</h1>
    }
    <router-outlet />
  `
})
export class AppComponent implements OnInit {

  title?: string;

  constructor(private readonly storageMap: StorageMap) {}

  ngOnInit(): void {

    const key = "key";
    const value = "hello world";

    localForage.setItem(key, value).then(() => {

      this.storageMap.get(key, { type: "string" }).subscribe((result) => {
        if (result) {
          this.title = result;
        }
      });

    }).catch(() => {
      // Nothing do to
    });

  }

}
