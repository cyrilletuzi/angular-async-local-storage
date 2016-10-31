import { Observable } from 'rxjs/Observable';

export interface AsyncLocalDatabase {
    getItem(key: string): Observable<any>;
    setItem(key: string, data: any): Observable<boolean>;
    removeItem(key: string): Observable<boolean>;
    clear(): Observable<boolean>;
}
