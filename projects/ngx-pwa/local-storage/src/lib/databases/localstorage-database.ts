import { Injectable, Inject } from '@angular/core';
import { Observable, of, throwError, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

import { LocalDatabase } from './local-database';
import { SerializationError } from './exceptions';
import { LS_PREFIX } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageDatabase implements LocalDatabase {

  /**
   * Optional user prefix to avoid collision for multiple apps on the same subdomain
   */
  readonly prefix: string;

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param prefix Prefix option to avoid collision for multiple apps on the same subdomain or for interoperability
   */
  constructor(
    @Inject(LS_PREFIX) prefix = '',
  ) {

    /* Prefix if asked, or no prefix otherwise */
    this.prefix = prefix || '';

  }

  /**
   * Number of items in `localStorage`
   */
  get size(): Observable<number> {

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(localStorage.length);

  }

  /**
   * Gets an item value in `localStorage`
   * @param key The item's key
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS `Observable`
   */
  get<T = any>(key: string): Observable<T | undefined> {

    /* Get raw data */
    const unparsedData = localStorage.getItem(this.prefixKey(key));

    let parsedData: T | undefined;

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
  set(key: string, data: any): Observable<undefined> {

    let serializedData: string | null = null;

    /* Check if data can be serialized */
    const dataPrototype = Object.getPrototypeOf(data);
    if ((typeof data === 'object') && (data !== null) && !Array.isArray(data) &&
    !((dataPrototype === Object.prototype) || (dataPrototype === null))) {
      return throwError(new SerializationError());
    }

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

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(undefined);

  }

  /**
   * Deletes an item in `localStorage`
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  delete(key: string): Observable<undefined> {

    localStorage.removeItem(this.prefixKey(key));

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(undefined);

  }

  /**
   * Deletes all items in `localStorage`
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<undefined> {

    localStorage.clear();

    /* Wrap in a RxJS `Observable` to be consistent with other storages */
    return of(undefined);

  }

  /**
   * Get all keys in `localStorage`
   * Note the order of the keys may be inconsistent in Firefox
   * @returns A RxJS `Observable` iterating on keys
   */
  keys(): Observable<string> {

    /* Create an `Observable` from keys */
    return new Observable<string>((subscriber) => {

      /* Iteretate over all the indexes */
      for (let index = 0; index < localStorage.length; index += 1) {

        /* Cast as we are sure in this case the key is not `null` */
        subscriber.next(this.getUnprefixedKey(index) as string);

      }

      subscriber.complete();

    }).pipe(
      /* Required to work like other databases which are asynchronous */
      observeOn(asyncScheduler),
    );

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
  protected getUnprefixedKey(index: number): string | null {

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
  protected prefixKey(key: string): string {

    return `${this.prefix}${key}`;

  }

}
