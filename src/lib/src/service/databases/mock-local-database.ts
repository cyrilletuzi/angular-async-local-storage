import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { AsyncLocalDatabase } from './async-local-database';

@Injectable()
export class MockLocalDatabase extends AsyncLocalDatabase {

    protected localStorage = new Map<string, any>();

    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    public getItem<T = any>(key: string): Observable<T | null> {

        let data = this.localStorage.get(key);

        return Observable.of((data !== undefined) ? data : null);

    }

    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    public setItem(key: string, data: any): Observable<boolean> {

        this.localStorage.set(key, data);

        return Observable.of(true);

    }

    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    public removeItem(key: string): Observable<boolean> {

        this.localStorage.delete(key);

        return Observable.of(true);

    }

    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    public clear(): Observable<boolean> {

        this.localStorage.clear();

        return Observable.of(true);

    }

}
