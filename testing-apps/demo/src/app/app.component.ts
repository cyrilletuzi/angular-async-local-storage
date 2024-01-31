import { AsyncPipe, JsonPipe } from "@angular/common";
import { Component, type OnInit } from "@angular/core";
import { StorageMap, type JSONSchema } from "@ngx-pwa/local-storage";
import { Observable, of } from "rxjs";
import { catchError, mergeMap, toArray } from "rxjs/operators";
import { DataService } from "./data.service";

interface Data {
  title: string;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `
    <!-- eslint-disable @angular-eslint/template/cyclomatic-complexity -->
    @if (getItem$ | async; as getItem) {
      <p id="get-item">{{getItem.title}}</p>
    }
    @if (schemaError$ | async; as schemaError) {
      <p id="schema-error">{{schemaError}}</p>
    }
    @if (removeItem) {
      <p id="remove-item">removeItem</p>
    }
    @if (clear) {
      <p id="clear">clear</p>
    }
    @if (length$ | async; as length) {
      <p id="length">{{length}}</p>
    }
    @if (keys$ | async; as keys) {
      <p id="keys">{{keys | json}}</p>
    }
    @if (has$ | async) {
      <p id="has">has</p>
    }
    @if (service$ | async; as service) {
      <p id="service">{{service}}</p>
    }
    <iframe src="http://localhost:4202"></iframe>
  `
})
export class AppComponent implements OnInit {

  getItem$!: Observable<Data | undefined>;
  schemaError$!: Observable<string | undefined>;
  removeItem = false;
  clear = false;
  size$!: Observable<number>;
  length$!: Observable<number>;
  keys$!: Observable<string[]>;
  has$!: Observable<boolean>;
  service$!: Observable<string | undefined>;

  constructor(private readonly storageMap: StorageMap, private readonly dataService: DataService) {}

  ngOnInit(): void {

    const schema: JSONSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
      },
      required: ["title"],
    };

    this.storageMap.set("clear", "test").pipe(
      mergeMap(() => this.storageMap.clear()),
      mergeMap(() => this.storageMap.get("clear", { type: "string" })),
    ).subscribe((result) => {

      /* Waiting for the `.clear()` to be done before other operations,
       * as all operations are asynchronous, `.clear()` could interfer with the other tests */

      if (result === undefined) {
        this.clear = true;
      }

      this.getItem$ = this.storageMap.set("getItemTest", { title: "hello world" }).pipe(
        mergeMap(() => this.storageMap.get<Data>("getItemTest", schema)),
      );

      this.schemaError$ = this.storageMap.set("schemaError", { wrong: "test" }).pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        mergeMap(() => this.storageMap.get("schemaError", schema as any)),
        catchError(() => of("schema error")),
      );

      this.storageMap.set("removeItem", "test").pipe(
        mergeMap(() => this.storageMap.delete("removeItem")),
        mergeMap(() => this.storageMap.get("removeItem", { type: "string" })),
      // eslint-disable-next-line rxjs/no-nested-subscribe
      ).subscribe((removeResult) => {
        if (removeResult === undefined) {
          this.removeItem = true;
        }
      });

      this.length$ = this.storageMap.set("size1", "test").pipe(
        mergeMap(() => this.storageMap.set("size2", "test")),
        mergeMap(() => this.storageMap.size),
      );

      this.keys$ = this.storageMap.set("keys", "test").pipe(
        mergeMap(() => this.storageMap.keys()),
        toArray(),
      );

      this.has$ = this.storageMap.set("has", "test").pipe(
        mergeMap(() => this.storageMap.has("has")),
      );

      this.service$ = this.dataService.data$;

    });

  }

}
