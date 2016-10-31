import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { AsyncLocalDatabase } from './async-local-database';
export declare class LocalStorageDatabase extends AsyncLocalDatabase {
    protected localStorage: Storage;
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    getItem(key: string): Observable<any>;
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    setItem(key: string, data: any): Observable<boolean>;
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    removeItem(key: string): Observable<boolean>;
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    clear(): Observable<boolean>;
}
