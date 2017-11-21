import { Observable } from 'rxjs/Observable';

import { ALSGetItemOptions } from '../lib.service';

export abstract class AsyncLocalDatabase {

  protected readonly getItemOptionsDefault = {
    schema: null
  };

  abstract getItem<T = any>(key: string, options?: ALSGetItemOptions): Observable<T | null>;
  abstract setItem(key: string, data: any): Observable<boolean>;
  abstract removeItem(key: string): Observable<boolean>;
  abstract clear(): Observable<boolean>;

}
