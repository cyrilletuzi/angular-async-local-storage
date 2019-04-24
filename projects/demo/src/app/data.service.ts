import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  data$: Observable<string | undefined>;

  constructor(private storageMap: StorageMap) {
    this.data$ = this.storageMap.set('serviceTest', 'service').pipe(
      mergeMap(() => this.storageMap.get('serviceTest', { type: 'string' })),
    );
  }

}
