import { AsyncPipe } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
import { StorageMap, type JSONSchema } from "@ngx-pwa/local-storage";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

interface Data {
  title: string;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    AsyncPipe,
  ],
  template: `
    <h1>{{(data$ | async)?.title}}</h1>
  `
})
export class AppComponent implements OnInit {

  title = "LocalStorage";
  data$!: Observable<Data | undefined>;

  constructor(private readonly storageMap: StorageMap) {}

  ngOnInit(): void {

    const key = "test";
    const schema: JSONSchema = {
      type: "object",
      properties: {
        title: {
          type: "string"
        }
      }
    };

    this.data$ = this.storageMap.set(key, { title: this.title }).pipe(
      switchMap(() => this.storageMap.get<Data>(key, schema))
    );

  }

}
