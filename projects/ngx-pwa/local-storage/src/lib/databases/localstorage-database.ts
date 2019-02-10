import { Injectable, Inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { LocalDatabase } from './local-database';
import { PREFIX } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageDatabase implements LocalDatabase {

  /**
   * Optional user prefix to avoid collision for multiple apps on the same subdomain
   */
  private prefix = '';

  /**
   * Number of items in `localStorage`
   */
  get size(): Observable<number> {

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(localStorage.length);

  }

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param prefix Optional user prefix to avoid collision for multiple apps on the same subdomain
   */
  constructor(@Inject(PREFIX) userPrefix = '') {

    if (userPrefix) {
      this.prefix = `${userPrefix}_`;
    }

  }

  /**
   * Gets an item value in `localStorage`
   * @param key The item's key
   * @returns The item's value if the key exists, `null` otherwise, wrapped in a RxJS `Observable`
   */
  getItem<T = any>(key: string): Observable<T | null> {

    /* Get raw data */
    const unparsedData = localStorage.getItem(this.prefixKey(key));

    let parsedData: T | null = null;

    /* No need to parse if data is `null` or `undefined` */
    if ((unparsedData !== undefined) && (unparsedData !== null)) {

      /* Try to parse */
      try {
        parsedData = JSON.parse(unparsedData) as T;
      } catch (error) {
        return throwError(error as SyntaxError);
      }

    }

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(parsedData);

  }

  /**
   * Store an item in `localStorage`
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  setItem(key: string, data: any): Observable<boolean> {

    /* Storing `undefined` or `null` in `localStorage` can cause issues in some browsers and has no sense */
    if ((data !== undefined) && (data !== null)) {

      let serializedData: string | null = null;

      /* Try to stringify (can fail on circular references) */
      try {
        serializedData = JSON.stringify(data);
      } catch (error) {
        return throwError(error as TypeError);
      }

      /* Can fail if storage quota is exceeded */
      try {
        localStorage.setItem(this.prefixKey(key), serializedData);
      } catch (error) {
        return throwError(error as DOMException);
      }

    }

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(true);

  }

  /**
   * Deletes an item in `localStorage`
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    localStorage.removeItem(this.prefixKey(key));

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(true);

  }

  /**
   * Deletes all items in `localStorage`
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<boolean> {

    localStorage.clear();

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(true);

  }

  /**
   * Get all keys in `localStorage`
   * Note the order of the keys may be inconsistent in Firefox
   * @returns A RxJS `Observable` containing the list of keys
   */
  keys(): Observable<string[]> {

    const keys: string[] = [];

    /* Iteretate over all the indexes */
    for (let index = 0; index < localStorage.length; index += 1) {

      /* Cast as we are sure in this case the key is not `null` */
      keys.push(this.getUnprefixedKey(index) as string);

    }

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(keys);

  }

  /**
   * Check if a key exists in `localStorage`
   * @param key The item's key
   * @returns A RxJS `Observable` telling if the key exists or not
   */
  has(key: string): Observable<boolean> {

    /* Itérate over all indexes in storage */
    for (let index = 0; index < localStorage.length; index += 1) {

      if (key === this.getUnprefixedKey(index)) {

        /* Wrap in a RxJS `Observable` to be consistent with other storages */
        return of(true);

      }

    }

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(false);

  }

  /**
   * Get an unprefixed key
   * @param index Index of the key
   * @returns The unprefixed key name if exists, `null` otherwise
   */
  private getUnprefixedKey(index: number): string | null {

    /* Get the key in storage: may have a prefix */
    const prefixedKey = localStorage.key(index);

    if (prefixedKey !== null) {

      /* If no prefix, the key is already good, otherwrite strip the prefix */
      return !this.prefix ? prefixedKey : prefixedKey.substr(this.prefix.length);

    }

    return null;

  }

  /**
   * Add the prefix to a key
   * @param key The key name
   * @returns The prefixed key name
   */
  private prefixKey(key: string): string {

    return `${this.prefix}${key}`;

  }

}
