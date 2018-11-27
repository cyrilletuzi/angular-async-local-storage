import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { LocalDatabase } from './local-database';

@Injectable({
  providedIn: 'root'
})
export class MockLocalDatabase implements LocalDatabase {

  protected localStorage = new Map<string, any>();

  get size(): Observable<number> {
    return of(this.localStorage.size);
  }

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
   getItem<T = any>(key: string): Observable<T | null> {

    const rawData: T | null = this.localStorage.get(key);

    return of((rawData !== undefined) ? rawData : null);

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
   setItem(key: string, data: any): Observable<boolean> {

    this.localStorage.set(key, data);

    return of(true);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
   removeItem(key: string): Observable<boolean> {

    this.localStorage.delete(key);

    return of(true);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
   clear(): Observable<boolean> {

    this.localStorage.clear();

    return of(true);

  }

  keys(): Observable<string[]> {

    return of(Array.from(this.localStorage.keys()));

  }

  has(key: string): Observable<boolean> {

    return of(this.localStorage.has(key));

  }

}
