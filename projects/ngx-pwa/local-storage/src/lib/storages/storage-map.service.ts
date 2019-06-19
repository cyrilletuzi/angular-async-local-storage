import { Injectable, Inject } from '@angular/core';
import { Observable, throwError, of, OperatorFunction } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { ValidationError } from './exceptions';
import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf, JSONValidator
} from '../validation';
import { LocalDatabase, IDB_BROKEN_ERROR, LocalStorageDatabase, IndexedDBDatabase, MemoryDatabase } from '../databases';
import { LS_PREFIX, LOCAL_STORAGE_PREFIX } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class StorageMap {

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param database Storage to use
   * @param jsonValidator Validator service
   * @param LSPrefix Prefix for `localStorage` keys to avoid collision for multiple apps on the same subdomain or for interoperability
   * @param oldPrefix Prefix option prior to v8 to avoid collision for multiple apps on the same subdomain or for interoperability
   */
  constructor(
    protected database: LocalDatabase,
    protected jsonValidator: JSONValidator = new JSONValidator(),
    @Inject(LS_PREFIX) protected LSPrefix = '',
    // tslint:disable-next-line: deprecation
    @Inject(LOCAL_STORAGE_PREFIX) protected oldPrefix = '',
  ) {}

  /**
   * **Number of items** in storage, wrapped in an `Observable`.
   *
   * @example
   * this.storageMap.size.subscribe((size) => {
   *   console.log(size);
   * });
   */
  get size(): Observable<number> {

    return this.database.size;

  }

  /**
   * Tells you which storage engine is used. *Only useful for interoperability.*
   * Note that due to some browsers issues in some special contexts
   * (Firefox private mode and Safari cross-origin iframes),
   * **this information may be wrong at initialization,**
   * as the storage could fallback from `indexedDB` to `localStorage`
   * only after a first read or write operation.
   * @returns Storage engine used
   *
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/INTEROPERABILITY.md}
   *
   * @example
   * if (this.storageMap.backingEngine === 'indexedDB') {}
   */
  get backingEngine(): 'indexedDB' | 'localStorage' | 'memory' | 'unknown' {

    if (this.database instanceof IndexedDBDatabase) {

      return 'indexedDB';

    } else if (this.database instanceof LocalStorageDatabase) {

      return 'localStorage';

    } else if (this.database instanceof MemoryDatabase) {

      return 'memory';

    } else {

      return 'unknown';

    }

  }

  /**
   * Info about `indexedDB` database. *Only useful for interoperability.*
   * @returns `indexedDB` database name, store name and database version.
   * **Values will be empty if the storage is not `indexedDB`,**
   * **so it should be used after an engine check**.
   *
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/INTEROPERABILITY.md}
   *
   * @example
   * if (this.storageMap.backingEngine === 'indexedDB') {
   *   const { database, store, version } = this.storageMap.backingStore;
   * }
   */
  get backingStore(): { database: string, store: string, version: number } {

    return (this.database instanceof IndexedDBDatabase) ?
      this.database.backingStore :
      { database: '', store: '', version: 0 };

  }

  /**
   * Info about `localStorage` fallback storage. *Only useful for interoperability.*
   * @returns `localStorage` prefix.
   * **Values will be empty if the storage is not `localStorage`,**
   * **so it should be used after an engine check**.
   *
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/INTEROPERABILITY.md}
   *
   * @example
   * if (this.storageMap.backingEngine === 'localStorage') {
   *   const { prefix } = this.storageMap.fallbackBackingStore;
   * }
   */
  get fallbackBackingStore(): { prefix: string } {

    return (this.database instanceof LocalStorageDatabase) ?
      { prefix: this.database.prefix } :
      { prefix: '' };

  }

  /**
   * Get an item value in storage.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   * @param key The item's key
   * @param schema Optional JSON schema to validate the data
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS `Observable`
   *
   * @example
   * this.storageMap.get('key', { type: 'string' }).subscribe((result) => {
   *   result; // string or undefined
   * });
   *
   * @example
   * interface User {
   *   firstName: string;
   *   lastName?: string;
   * }
   *
   * const schema = {
   *   type: 'object',
   *   properties: {
   *     firstName: { type: 'string' },
   *     lastName: { type: 'string' },
   *   },
   *   required: ['firstName']
   * };
   *
   * this.storageMap.get<User>('user', schema).subscribe((user) => {
   *   if (user) {
   *     user.firstName;
   *   }
   * });
   */
  get<T = string>(key: string, schema: JSONSchemaString): Observable<string | undefined>;
  get<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<number | undefined>;
  get<T = boolean>(key: string, schema: JSONSchemaBoolean): Observable<boolean | undefined>;
  get<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<string[] | undefined>;
  get<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<number[] | undefined>;
  get<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<boolean[] | undefined>;
  get<T = any>(key: string, schema: JSONSchema): Observable<T | undefined>;
  get<T = unknown>(key: string, schema?: JSONSchema): Observable<unknown>;
  get<T = any>(key: string, schema?: JSONSchema) {

    /* Get the data in storage */
    return this.database.get<T>(key).pipe(
      /* Check if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.get<T>(key)),
      mergeMap((data) => {

        /* No need to validate if the data is empty */
        if ((data === undefined) || (data === null)) {

          return of(undefined);

        } else if (schema) {

          /* Validate data against a JSON schema if provided */
          if (!this.jsonValidator.validate(data, schema)) {
            return throwError(new ValidationError());
          }

          /* Data have been checked, so it's OK to cast */
          return of(data as T | undefined);

        }

        /* Cast to unknown as the data wasn't checked */
        return of(data as unknown);

      }),
    );

  }

  /**
   * Set an item in storage.
   * Note that setting `null` or `undefined` will remove the item to avoid some browsers issues.
   * @param key The item's key
   * @param data The item's value
   * @param schema Optional JSON schema to validate the data
   * @returns A RxJS `Observable` to wait the end of the operation
   *
   * @example
   * this.storageMap.set('key', 'value').subscribe(() => {});
   */
  set(key: string, data: any, schema?: JSONSchema): Observable<undefined> {

    /* Storing `undefined` or `null` is useless and can cause issues in `indexedDb` in some browsers,
     * so removing item instead for all storages to have a consistent API */
    if ((data === undefined) || (data === null)) {
      return this.delete(key);
    }

    /* Validate data against a JSON schema if provided */
    if (schema && !this.jsonValidator.validate(data, schema)) {
      return throwError(new ValidationError());
    }

    return this.database.set(key, data)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.set(key, data)));

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   *
   * @example
   * this.storageMap.delete('key').subscribe(() => {});
   */
  delete(key: string): Observable<undefined> {

    return this.database.delete(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.delete(key)));

  }

  /**
   * Delete all items in storage
   * @returns A RxJS `Observable` to wait the end of the operation
   *
   * @example
   * this.storageMap.clear().subscribe(() => {});
   */
  clear(): Observable<undefined> {

    return this.database.clear()
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.clear()));

  }

  /**
   * Get all keys stored in storage. Note **this is an *iterating* `Observable`**:
   * * if there is no key, the `next` callback will not be invoked,
   * * if you need to wait the whole operation to end, be sure to act in the `complete` callback,
   * as this `Observable` can emit several values and so will invoke the `next` callback several times.
   * @returns A list of the keys wrapped in a RxJS `Observable`
   *
   * @example
   * this.storageMap.keys().subscribe({
   *   next: (key) => { console.log(key); },
   *   complete: () => { console.log('Done'); },
   * });
   */
  keys(): Observable<string> {

    return this.database.keys()
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.keys()));

  }

  /**
   * Tells if a key exists in storage
   * @returns A RxJS `Observable` telling if the key exists
   *
   * @example
   * this.storageMap.has('key').subscribe((hasKey) => {
   *   if (hasKey) {}
   * });
   */
  has(key: string): Observable<boolean> {

    return this.database.has(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.has(key)));

  }

  /**
   * RxJS operator to catch if `indexedDB` is broken
   * @param operationCallback Callback with the operation to redo
   */
  protected catchIDBBroken<T>(operationCallback: () => Observable<T>): OperatorFunction<T, T> {

    return catchError((error) => {

      /* Check if `indexedDB` is broken based on error message (the specific error class seems to be lost in the process) */
      if ((error !== undefined) && (error !== null) && (error.message === IDB_BROKEN_ERROR)) {

        /* When storage is fully disabled in browser (via the "Block all cookies" option),
         * just trying to check `localStorage` variable causes a security exception.
         * Prevents https://github.com/cyrilletuzi/angular-async-local-storage/issues/118
         */
        try {

          if ('getItem' in localStorage) {

            /* Fallback to `localStorage` if available */
            this.database = new LocalStorageDatabase(this.LSPrefix, this.oldPrefix);

          }

        } catch {

          /* Fallback to memory storage otherwise */
          this.database = new MemoryDatabase();

        }

        /* Redo the operation */
        return operationCallback();

      } else {

        /* Otherwise, rethrow the error */
        return throwError(error);

      }

    });

  }

}
