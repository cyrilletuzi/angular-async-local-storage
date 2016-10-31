import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { AsyncLocalDatabase } from './async-local-database';
export declare class IndexedDBDatabase extends AsyncLocalDatabase {
    /**
     * IndexedDB database name for local storage
     */
    protected readonly dbName: string;
    /**
     * IndexedDB object store name for local storage
     */
    protected readonly objectStoreName: string;
    /**
     * IndexedDB key path name for local storage (where an item's key will be stored)
     */
    protected readonly keyPath: string;
    /**
     * IndexedDB data path name for local storage (where items' value will be stored)
     */
    protected readonly dataPath: string;
    /**
     * IndexedDB database connection, wrapped in a RxJS ReplaySubject to be able to access the connection
     * even after the connection success event happened
     */
    protected database: ReplaySubject<IDBDatabase>;
    /**
     * Connects to IndexedDB
     */
    constructor();
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
    /**
     * Connects to IndexedDB and creates the object store on first time
     */
    protected connect(): void;
    /**
     * Opens an IndexedDB transaction and gets the local storage object store
     * @param mode Default to 'readonly' for read operations, or 'readwrite' for write operations
     * @returns An IndexedDB transaction object store, wrapped in an RxJS Observable
     */
    protected transaction(mode?: 'readonly' | 'readwrite'): Observable<IDBObjectStore>;
    /**
     * Transforms a IndexedDB success event in an RxJS Observable
     * @param request The request to listen
     * @returns A RxJS Observable with true value
     */
    protected toSuccessObservable(request: IDBRequest): Observable<boolean>;
    /**
     * Transforms a IndexedDB error event in an RxJS ErrorObservable
     * @param request The request to listen
     * @param error Optionnal details about the error's origin
     * @returns A RxJS ErrorObservable
     */
    protected toErrorObservable(request: IDBRequest, error?: string): Observable<any>;
}
