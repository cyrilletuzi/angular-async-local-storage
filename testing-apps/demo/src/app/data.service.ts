import { Injectable } from "@angular/core";
import { StorageMap } from "@ngx-pwa/local-storage";
import { Observable, mergeMap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {

  data$: Observable<string | undefined>;

  constructor(storageMap: StorageMap) {

    this.data$ = storageMap.set("serviceTest", "service").pipe(
      mergeMap(() => storageMap.get("serviceTest", { type: "string" })),
    );

  }

}
