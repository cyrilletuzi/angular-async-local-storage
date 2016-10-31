import { Injectable } from '@angular/core';

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

@Injectable()
export class IndexedDBDatabase implements AsyncLocalDatabase {

    /** 
     * IndexedDB database name for local storage 
     */
    protected readonly dbName: string = 'ngStorage';
    /** 
     * IndexedDB object store name for local storage
     */
    protected readonly objectStoreName: string = 'localStorage';
    /** 
     * IndexedDB key path name for local storage (where an item's key will be stored) 
     */
    protected readonly keyPath: string = 'key';
    /** 
     * IndexedDB data path name for local storage (where items' value will be stored)
     */
    protected readonly dataPath: string = 'value';
    /** 
     * IndexedDB database connection, wrapped in a RxJS ReplaySubject to be able to access the connection
     * even after the connection success event happened 
     */
    protected database: ReplaySubject<IDBDatabase>;

    /** 
     * Connects to IndexedDB
     */
    public constructor() {

        /* Creating the RxJS ReplaySubject */
        this.database = new ReplaySubject<IDBDatabase>();

        /* Connecting to IndexedDB */
        this.connect();

    }

    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    public getItem(key: string): Observable<any> {

        /* Opening a trasaction and requesting the item in local storage */
        return this.transaction().map((transaction) => transaction.get(key)).mergeMap((request) => {

            /* Listening to the success event, and passing the item value if found, null otherwise */
            let success = Observable.fromEvent(request, 'success')
                .pluck('target', 'result')
                .map((result) => result ? result[this.dataPath] : null);

            /* Merging success and errors events and autoclosing the observable */
            return Observable.merge(success, this.toErrorObservable(request, `getter`)).first();

        });

    }

    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    public setItem(key: string, data: any): Observable<boolean> {

        /* Opening a transaction and checking if the item already exists in local storage */
        return this.getItem(key).map((data) => (data == null) ? 'add' : 'put').mergeMap((method) => {

            /* Opening a transaction */
            return this.transaction('readwrite').mergeMap((transaction) => {

                /* Adding or updating local storage, based on previous checking */
                let request = transaction[method]({ [this.dataPath]: data }, key);

                /* Merging success (passing true) and error events and autoclosing the observable */
                return Observable.merge(this.toSuccessObservable(request), this.toErrorObservable(request, `setter`)).first();

            });

        });

    }

    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    public removeItem(key: string): Observable<boolean> {

        /* Opening a transaction and checking if the item exists in local storage */
        return this.getItem(key).mergeMap((data) => {

            /* If the item exists in local storage */
            if (data != null) {

                /* Opening a transaction */
                return this.transaction('readwrite').mergeMap((transaction) => {

                    /* Deleting the item in local storage */
                    let request = transaction.delete(key);

                    /* Merging success (passing true) and error events and autoclosing the observable */
                    return Observable.merge(this.toSuccessObservable(request), this.toErrorObservable(request, `remover`)).first();

                });

            }

            /* Passing true if the item does not exist in local storage */
            return Observable.of(true).first();

        });

    }

    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    public clear(): Observable<boolean> {

        /* Opening a transaction */
        return this.transaction('readwrite').mergeMap((transaction) => {

            /* Deleting all items from local storage */
            let request = transaction.clear();

            /* Merging success (passing true) and error events and autoclosing the observable */
            return Observable.merge(this.toSuccessObservable(request), this.toErrorObservable(request, `clearer`)).first();

        });

    }

    /**
     * Connects to IndexedDB and creates the object store on first time
     */
    protected connect(): void {
        
        /* Connecting to IndexedDB */
        let request = indexedDB.open(this.dbName);

        /* Listening the event fired on first connection, creating the object store for local storage */
        Observable.fromEvent(request, 'upgradeneeded').first().subscribe((event: Event) => {

            /* Getting the database connection */
            let database = (event.target as IDBRequest).result as IDBDatabase;

            /* Checking if the object store already exists, to avoid error */
            if (!database.objectStoreNames.contains(this.objectStoreName)) {

                /* Creating the object store for local storage */
                database.createObjectStore(this.objectStoreName);

            }

        });

        /* Listening the success event and converting to an RxJS Observable */
        let success = Observable.fromEvent(request, 'success');

        /* Merging success and errors events */
        Observable.merge(success, this.toErrorObservable(request, `connection`)).first().subscribe((event: Event) => {

                /* Storing the database connection for further access */
                this.database.next((event.target as IDBRequest).result as IDBDatabase);

        });

    }

    /**
     * Opens an IndexedDB transaction and gets the local storage object store
     * @param mode Default to 'readonly' for read operations, or 'readwrite' for write operations
     * @returns An IndexedDB transaction object store, wrapped in an RxJS Observable
     */
    protected transaction(mode: 'readonly' | 'readwrite' = 'readonly'): Observable<IDBObjectStore> {

        /* From the IndexedDB connection, opening a transaction and getting the local storage objet store */
        return this.database.map((database) => database.transaction([this.objectStoreName], mode).objectStore(this.objectStoreName));

    }

    /**
     * Transforms a IndexedDB success event in an RxJS Observable
     * @param request The request to listen
     * @returns A RxJS Observable with true value
     */
    protected toSuccessObservable(request: IDBRequest) {

        /* Transforming a IndexedDB success event in an RxJS Observable with true value */
        return Observable.fromEvent(request, 'success').map(() => true);

    }

    /**
     * Transforms a IndexedDB error event in an RxJS ErrorObservable
     * @param request The request to listen
     * @param error Optionnal details about the error's origin
     * @returns A RxJS ErrorObservable
     */
    protected toErrorObservable(request: IDBRequest, error: string = ``) {

        /* Transforming a IndexedDB error event in an RxJS ErrorObservable */
        return Observable.fromEvent(request, 'error').mergeMap(() => Observable.throw(new Error(`IndexedDB ${error} issue.`)));

    }

}
