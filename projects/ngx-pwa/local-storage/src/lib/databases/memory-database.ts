import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { LocalDatabase } from './local-database';

@Injectable({
  providedIn: 'root'
})
export class MemoryDatabase implements LocalDatabase {

  /**
   * Memory storage
   */
  private memoryStorage = new Map<string, any>();

  /**
   * Number of items in memory
   */
  get size(): Observable<number> {

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(this.memoryStorage.size);

  }

  /**
   * Gets an item value in memory
   * @param key The item's key
   * @returns The item's value if the key exists, `null` otherwise, wrapped in a RxJS `Observable`
   */
   get<T = any>(key: string): Observable<T |undefined> {

    const rawData = this.memoryStorage.get(key) as T | undefined;

    /* If data is `undefined`, returns `null` instead for the API to be consistent.
     * Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(rawData);

  }

  /**
   * Sets an item in memory
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
   set(key: string, data: any): Observable<undefined> {

    /* Storing `undefined` or `null` in `localStorage` is useless, so removing item instead */
    if ((data === undefined) || (data === null)) {
      return this.delete(key);
    }

    this.memoryStorage.set(key, data);

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(undefined);

  }

  /**
   * Deletes an item in memory
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
   delete(key: string): Observable<undefined> {

    this.memoryStorage.delete(key);

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(undefined);

  }

  /**
   * Deletes all items in memory
   * @returns A RxJS `Observable` to wait the end of the operation
   */
   clear(): Observable<undefined> {

    this.memoryStorage.clear();

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(undefined);

  }

  /**
   * Get all keys in memory
   * @returns List of all keys, wrapped in a RxJS `Observable`
   */
  keys(): Observable<string[]> {

    /* Transform to a classic array for the API to be consistent */
    const keys = Array.from(this.memoryStorage.keys());

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(keys);

  }

  /**
   * Check if a key exists in memory
   * @param key Key name
   * @returns a RxJS `Observable` telling if the key exists or not
   */
  has(key: string): Observable<boolean> {

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(this.memoryStorage.has(key));

  }

}
