import { Component, inject, signal, type OnInit } from "@angular/core";
import { StorageMap, type JSONSchema } from "@ngx-pwa/local-storage";
import { switchMap } from "rxjs/operators";

interface Data {
  title: string;
}

@Component({
  selector: "app-root",
  template: `
    <h1>{{ data()?.title }}</h1>
  `
})
export class App implements OnInit {

  title = "LocalStorage";
  data = signal<Data | undefined>(undefined);

  private readonly storageMap = inject(StorageMap);

  ngOnInit(): void {

    const key = "test";
    const schema = {
      type: "object",
      properties: {
        title: {
          type: "string"
        }
      }
    } satisfies JSONSchema;

    this.storageMap.set(key, { title: this.title }).pipe(
      switchMap(() => this.storageMap.get<Data>(key, schema))
    ).subscribe((result) => {
      this.data.set(result);
    });

  }

}
