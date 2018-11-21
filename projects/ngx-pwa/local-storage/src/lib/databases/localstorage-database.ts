import { Injectable, Optional, Inject } from '@angular/core';
import { Observable, of, from, throwError, EMPTY } from 'rxjs';

import { LocalDatabase } from './local-database';
import { LOCAL_STORAGE_PREFIX } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageDatabase implements LocalDatabase {

  /* Initializing native localStorage right now to be able to check its support on class instanciation */
  protected prefix = '';

  get size(): Observable<number> {
    return of(localStorage.length);
  }

  constructor(@Optional() @Inject(LOCAL_STORAGE_PREFIX) protected userPrefix: string | null = null) {

    if (userPrefix) {
      this.prefix = `${userPrefix}_`;
    }

  }

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string): Observable<T | null> {

    const unparsedData = localStorage.getItem(`${this.prefix}${key}`);
    let parsedData: T | null = null;

    if (unparsedData != null) {

      try {
        parsedData = JSON.parse(unparsedData);
      } catch (error) {
        return throwError(new Error(`Invalid data in localStorage.`));
      }

    }

    return of(parsedData);

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
  setItem(key: string, data: any): Observable<boolean> {

    localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(data));

    return of(true);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    localStorage.removeItem(`${this.prefix}${key}`);

    return of(true);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
  clear(): Observable<boolean> {

    localStorage.clear();

    return of(true);

  }

  keys(): Observable<string> {

    const keys: string[] = [];

    for (let index = 0; index < localStorage.length; index += 1) {

      const key = localStorage.key(index) as string;

      keys.push((this.prefix === '') ? key : key.substr(this.prefix.length));

    }

    return (keys.length > 0) ? from(keys) : EMPTY;

  }

}
