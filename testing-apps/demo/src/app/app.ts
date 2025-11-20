import { JsonPipe } from "@angular/common";
import { Component, inject, signal, type OnInit } from "@angular/core";
import { StorageMap, type JSONSchema } from "@ngx-pwa/local-storage";
import { Observable, catchError, mergeMap, of, toArray } from "rxjs";
import { DataManager } from "./data-manager";

interface Data {
  title: string;
}

@Component({
  selector: "app-root",
  imports: [
    JsonPipe,
  ],
  template: `
    @if (getItem(); as getItem) {
      <p id="get-item">{{ getItem.title }}</p>
    }
    @if (schemaError(); as schemaError) {
      <p id="schema-error">{{ schemaError }}</p>
    }
    @if (removeItem()) {
      <p id="remove-item">removeItem</p>
    }
    @if (clear()) {
      <p id="clear">clear</p>
    }
    @if (length(); as length) {
      <p id="length">{{ length }}</p>
    }
    @if (keys(); as keys) {
      <p id="keys">{{keys | json}}</p>
    }
    @if (has()) {
      <p id="has">has</p>
    }
    @if (service(); as service) {
      <p id="service">{{ service }}</p>
    }
    <iframe src="http://localhost:4202"></iframe>
  `
})
export class App implements OnInit {

  private readonly storageMap = inject(StorageMap);
  private readonly dataService = inject(DataManager);

  getItem = signal<Data | undefined>(undefined);
  schemaError = signal<string | undefined>(undefined);
  removeItem = signal(false);
  clear = signal(false);
  size$?: Observable<number>;
  length = signal<number | undefined>(undefined);
  keys = signal<string[] | undefined>(undefined);
  has = signal<boolean | undefined>(undefined);
  service = signal<string | undefined>(undefined);

  ngOnInit(): void {

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
      },
      required: ["title"],
    } satisfies JSONSchema;

    this.storageMap.set("clear", "test").pipe(
      mergeMap(() => this.storageMap.clear()),
      mergeMap(() => this.storageMap.get("clear", { type: "string" })),
    ).subscribe((result) => {

      /* Waiting for the `.clear()` to be done before other operations,
       * as all operations are asynchronous, `.clear()` could interfer with the other tests */

      if (result === undefined) {
        this.clear.set(true);
      }

      this.storageMap.set("getItemTest", { title: "hello world" }).pipe(
        mergeMap(() => this.storageMap.get<Data>("getItemTest", schema)),
      ).subscribe((getItemResult) => {
        this.getItem.set(getItemResult);
      });

      this.storageMap.set("schemaError", { wrong: "test" }).pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-type-assertion
        mergeMap(() => this.storageMap.get("schemaError", schema as any)),
        catchError(() => of("schema error")),
      ).subscribe((schemaErrorResult) => {
        this.schemaError.set(schemaErrorResult);
      });

      this.storageMap.set("removeItem", "test").pipe(
        mergeMap(() => this.storageMap.delete("removeItem")),
        mergeMap(() => this.storageMap.get("removeItem", { type: "string" })),
      ).subscribe((removeResult) => {

        if (removeResult === undefined) {
          this.removeItem.set(true);
        }

      });

      this.storageMap.set("size1", "test").pipe(
        mergeMap(() => this.storageMap.set("size2", "test")),
        mergeMap(() => this.storageMap.size),
      ).subscribe((lengthResult) => {
        this.length.set(lengthResult);
      });

      this.storageMap.set("keys", "test").pipe(
        mergeMap(() => this.storageMap.keys()),
        toArray(),
      ).subscribe((keysResult) => {
        this.keys.set(keysResult);
      });

      this.storageMap.set("has", "test").pipe(
        mergeMap(() => this.storageMap.has("has")),
      ).subscribe((hasResult) => {
        this.has.set(hasResult);
      });

      this.dataService.data$.subscribe((serviceResult) => {
        this.service.set(serviceResult);
      });

    });

  }

}
