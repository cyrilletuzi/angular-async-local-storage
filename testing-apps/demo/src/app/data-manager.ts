import { inject, Injectable } from "@angular/core";
import { StorageMap } from "@ngx-pwa/local-storage";
import { mergeMap, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataManager {

  data$: Observable<string | undefined>;

  constructor() {

    const storageMap = inject(StorageMap);

    this.data$ = storageMap.set("serviceTest", "service").pipe(
      mergeMap(() => storageMap.get("serviceTest", { type: "string" })),
    );

  }

}
