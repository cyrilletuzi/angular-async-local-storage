import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  data$: Observable<string | null>;

  constructor(private localStorage: LocalStorage) {
    this.data$ = this.localStorage.setItem('serviceTest', 'service').pipe(
      mergeMap(() => this.localStorage.getItem('serviceTest', { type: 'string' })),
    );
  }

}
