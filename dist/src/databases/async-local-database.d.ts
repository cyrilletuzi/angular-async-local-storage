import { Observable } from 'rxjs/Observable';
export declare abstract class AsyncLocalDatabase {
    abstract getItem(key: string): Observable<any>;
    abstract setItem(key: string, data: any): Observable<boolean>;
    abstract removeItem(key: string): Observable<boolean>;
    abstract clear(): Observable<boolean>;
}
