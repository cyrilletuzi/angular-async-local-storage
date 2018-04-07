import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LocalDatabase } from './local-database';

@Injectable()
export class MockLocalDatabase extends LocalDatabase {

  protected localStorage = new Map<string, any>();

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
   getItem<T = any>(key: string) {

    const rawData: T | null = this.localStorage.get(key);

    return of((rawData !== undefined) ? rawData : null);

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
   setItem(key: string, data: any) {

    this.localStorage.set(key, data);

    return of(true);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
   removeItem(key: string) {

    this.localStorage.delete(key);

    return of(true);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
   clear() {

    this.localStorage.clear();

    return of(true);

  }

}
