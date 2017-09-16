import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AsyncLocalDatabase } from './databases/async-local-database';

@Injectable()
export class AsyncLocalStorage {

    protected database: AsyncLocalDatabase;

    /**
     * Injects a local database
     */
    public constructor(database: AsyncLocalDatabase) {

        this.database = database;

    }

    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    public getItem<T = any>(key: string): Observable<T | null> {

        return this.database.getItem(key);

    }

    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    public setItem(key: string, data: any): Observable<boolean> {

        return this.database.setItem(key, data);

    }

    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    public removeItem(key: string): Observable<boolean> {

        return this.database.removeItem(key);

    }

    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    public clear(): Observable<boolean> {

        return this.database.clear();

    }

}
