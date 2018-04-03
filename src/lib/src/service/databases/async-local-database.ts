import { Observable } from 'rxjs';

export abstract class AsyncLocalDatabase {

  abstract getItem<T = any>(key: string): Observable<T | null>;
  abstract setItem(key: string, data: any): Observable<boolean>;
  abstract removeItem(key: string): Observable<boolean>;
  abstract clear(): Observable<boolean>;

}
