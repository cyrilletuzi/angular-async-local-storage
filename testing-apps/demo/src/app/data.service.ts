import { Injectable } from "@angular/core";
import { StorageMap } from "@ngx-pwa/local-storage";
import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class DataService {

  data$: Observable<string | undefined>;

  constructor(private readonly storageMap: StorageMap) {
    this.data$ = this.storageMap.set("serviceTest", "service").pipe(
      mergeMap(() => this.storageMap.get("serviceTest", { type: "string" })),
    );
  }

}
