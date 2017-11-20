import { Observable } from 'rxjs/Observable';

import { JSONSchema } from '../validation/index';

export interface GetItemOptions {
  schema?: JSONSchema | null;
}

export abstract class AsyncLocalDatabase {

  protected readonly getItemOptionsDefault = {
    schema: null
  };

  abstract getItem<T = any>(key: string, options?: GetItemOptions): Observable<T | null>;
  abstract setItem(key: string, data: any): Observable<boolean>;
  abstract removeItem(key: string): Observable<boolean>;
  abstract clear(): Observable<boolean>;

}
