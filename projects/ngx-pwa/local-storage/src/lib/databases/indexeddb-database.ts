import { Injectable, Inject } from '@angular/core';
import { Observable, ReplaySubject, fromEvent, of, throwError, race } from 'rxjs';
import { map, mergeMap, first, takeWhile, tap } from 'rxjs/operators';

import { LocalDatabase } from './local-database';
import { IDBBrokenError } from './exceptions';
import {
  IDB_DB_NAME, IDB_STORE_NAME, DEFAULT_IDB_STORE_NAME, IDB_DB_VERSION, LOCAL_STORAGE_PREFIX,
  DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION, IDB_NO_WRAP, DEFAULT_IDB_NO_WRAP
} from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBDatabase implements LocalDatabase {

  /**
   * `indexedDB` database name
   */
  protected readonly dbName: string;

  /**
   * `indexedDB` object store name
   */
  protected readonly storeName: string;

  /**
   * `indexedDB` database version. Must be an unsigned **integer**
   */
  protected readonly dbVersion: number;

  /**
   * `indexedDB` database connection, wrapped in a RxJS `ReplaySubject` to be able to access the connection
   * even after the connection success event happened
   */
  protected readonly database = new ReplaySubject<IDBDatabase>(1);

  /**
   * Flag to not wrap `indexedDB` values for interoperability or to wrap for backward compatibility.
   */
  protected readonly noWrap: boolean;

  /**
   * Index used when wrapping value. *For backward compatibility only.*
   */
  protected readonly wrapIndex = 'value';

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param dbName `indexedDB` database name
   * @param storeName `indexedDB` store name
   * @param dbVersion `indexedDB` database version
   * @param noWrap `indexedDB` database version
   * @param oldPrefix Pre-v8 backward compatible prefix
   */
  constructor(
    @Inject(IDB_DB_NAME) dbName = DEFAULT_IDB_DB_NAME,
    @Inject(IDB_STORE_NAME) storeName = DEFAULT_IDB_STORE_NAME,
    @Inject(IDB_DB_VERSION) dbVersion = DEFAULT_IDB_DB_VERSION,
    @Inject(IDB_NO_WRAP) noWrap = DEFAULT_IDB_NO_WRAP,
    // tslint:disable-next-line: deprecation
    @Inject(LOCAL_STORAGE_PREFIX) oldPrefix = '',
  ) {

    /* Initialize `indexedDB` database name, with prefix if provided by the user */
    this.dbName = oldPrefix ? `${oldPrefix}_${dbName}` : dbName;

    this.storeName = storeName;
    this.dbVersion = dbVersion;
    this.noWrap = noWrap;

    /* Connect to `indexedDB`, with prefix if provided by the user */
    this.connect();

  }

  /**
   * Information about `indexedDB` connection. *Only useful for interoperability.*
   * @returns `indexedDB` database name, store name and database version
   */
  get backingStore(): { database: string, store: string, version: number } {

    return {
      database: this.dbName,
      store: this.storeName,
      version: this.dbVersion,
    };

  }

  /**
   * Number of items in our `indexedDB` database and object store
   */
  get size(): Observable<number> {

    /* Open a transaction in read-only mode */
    return this.transaction('readonly').pipe(
      mergeMap((store) => {

        /* Request to know the number of items */
        const request = store.count();

        /* Manage success and error events, and get the result */
        return this.requestEventsAndMapTo(request, () => request.result);

      }),
      /* The observable will complete after the first value */
      first(),
    );

  }

  /**
   * Gets an item value in our `indexedDB` store
   * @param key The item's key
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in an RxJS `Observable`
   */
  get<T = any>(key: string): Observable<T | undefined> {

    /* Open a transaction in read-only mode */
    return this.transaction('readonly').pipe(
      mergeMap((store) => {

        /* Request the value with the key provided by the user */
        const request = store.get(key);

        /* Manage success and error events, and get the result */
        return this.requestEventsAndMapTo(request, () => {

          if ((request.result !== undefined) && (request.result !== null)) {

            /* Prior to v8, the value was wrapped in an `{ value: ...}` object */
            if (!this.noWrap && (typeof request.result === 'object') && (this.wrapIndex in request.result) &&
            (request.result[this.wrapIndex] !== undefined) && (request.result[this.wrapIndex] !== null)) {

              return (request.result[this.wrapIndex] as T);

            } else {

              /* Cast to the wanted type */
              return request.result as T;

            }

          }

          /* Return `undefined` if the value is empty */
          return undefined;

        });

      }),
      /* The observable will complete after the first value */
      first(),
    );

  }

  /**
   * Sets an item in our `indexedDB` store
   * @param key The item's key
   * @param data The item's value
   * @returns An RxJS `Observable` to wait the end of the operation
   */
  set(key: string, data: any): Observable<undefined> {

    /* Storing `undefined` in `indexedDb` can cause issues in some browsers so removing item instead */
    if (data === undefined) {
      return this.delete(key);
    }

    /* Open a transaction in write mode */
    return this.transaction('readwrite').pipe(
      mergeMap((store) => {

        /* Prior to v8, data was wrapped in a `{ value: ... }` object */
        const dataToStore = this.noWrap ? data : { [this.wrapIndex]: data };

        /* Add if the item is not existing yet, or update otherwise */
        const request = store.put(dataToStore, key);

        /* Manage success and error events, and map to `true` */
        return this.requestEventsAndMapTo(request, () => undefined);

      }),
      /* The observable will complete after the first value */
      first(),
    );

  }

  /**
   * Deletes an item in our `indexedDB` store
   * @param key The item's key
   * @returns An RxJS `Observable` to wait the end of the operation
   */
  delete(key: string): Observable<undefined> {

    /* Open a transaction in write mode */
    return this.transaction('readwrite').pipe(
      mergeMap((store) => {

        /* Deletethe item in store */
        const request = store.delete(key);

        /* Manage success and error events, and map to `true` */
        return this.requestEventsAndMapTo(request, () => undefined);

      }),
      /* The observable will complete after the first value */
      first(),
    );

  }

  /**
   * Deletes all items from our `indexedDB` objet store
   * @returns An RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<undefined> {

    /* Open a transaction in write mode */
    return this.transaction('readwrite').pipe(
      mergeMap((store) => {

        /* Delete all items in object store */
        const request = store.clear();

        /* Manage success and error events, and map to `true` */
        return this.requestEventsAndMapTo(request, () => undefined);

      }),
      /* The observable will complete */
      first(),
    );

  }

  /**
   * Get all the keys in our `indexedDB` store
   * @returns An RxJS `Observable` iterating on each key
   */
  keys(): Observable<string> {

    /* Open a transaction in read-only mode */
    return this.transaction('readonly').pipe(
      /* `first()` is used as the final operator in other methods to complete the `Observable`
       * (as it all starts from a `ReplaySubject` which never ends),
       * but as this method is iterating over multiple values, `first()` **must** be used here */
      first(),
      mergeMap((store) => {

        /* Open a cursor on the store
         * `.openKeyCursor()` is better for performance, but only available in indexedDB v2 (missing in IE/Edge)
         * Avoid issues like https://github.com/cyrilletuzi/angular-async-local-storage/issues/69 */
        const request = ('openKeyCursor' in store) ? store.openKeyCursor() : (store as IDBObjectStore).openCursor();

        /* Listen to success event */
        const success$ = this.successEvent(request).pipe(
          /* Stop the `Observable` when the cursor is `null` */
          takeWhile(() => (request.result !== null)),
          /* This lib only allows string keys, but user could have added other types of keys from outside
           * It's OK to cast as the cursor as been tested in the previous operator */
          map(() => (request.result as IDBCursor).key.toString()),
          /* Iterate on the cursor */
          tap(() => { (request.result as IDBCursor).continue(); }),
        );

        /* Listen to error event and if so, throw an error */
        const error$ = this.errorEvent(request);

        /* Choose the first event to occur */
        return race([success$, error$]);

      }),
    );

  }

  /**
   * Check if a key exists in our `indexedDB` store
   * @returns An RxJS `Observable` telling if the key exists or not
   */
  has(key: string): Observable<boolean> {

    /* Open a transaction in read-only mode */
    return this.transaction('readonly').pipe(
      mergeMap((store) => {

        /* Check if the key exists in the store
         * `getKey()` is better but only available in `indexedDB` v2 (Chrome >= 58, missing in IE/Edge).
         * In older browsers, the value is checked instead, but it could lead to an exception
         * if `undefined` was stored outside of this lib (e.g. directly with the native `indexedDB` API).
         * Fixes https://github.com/cyrilletuzi/angular-async-local-storage/issues/69
         */
        const request =  ('getKey' in store) ? store.getKey(key) : (store as IDBObjectStore).get(key);

        /* Manage success and error events, and map to a boolean based on the existence of the key */
        return this.requestEventsAndMapTo(request, () => (request.result !== undefined) ? true : false);

      }),
      /* The observable will complete */
      first()
    );

  }

  /**
   * Connects to `indexedDB` and creates the object store on first time
   */
  protected connect(): void {

    let request: IDBOpenDBRequest;

    /* Connect to `indexedDB`
     * Will fail in Safari cross-origin iframes
     * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/42} */
    try {

      /* Do NOT explicit `window` here, as `indexedDB` could be used from a web worker too */
      request = indexedDB.open(this.dbName, this.dbVersion);

    } catch {

      this.database.error(new IDBBrokenError());

      return;

    }

    /* Create store on first connection */
    this.createStore(request);

    /* Listen to success and error events and choose the first to occur */
    race([this.successEvent(request), this.errorEvent(request)])
      /* The observable will complete */
      .pipe(first())
      .subscribe({
        next: () => {
          /* Register the database connection in the `ReplaySubject` for further access */
          this.database.next(request.result);
        },
        error: () => {
          /* Firefox private mode issue: fallback storage if IndexedDb connection is failing
          * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=781982}
          * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/26} */
          this.database.error(new IDBBrokenError());
        },
      });

  }

  /**
   * Create store on first use of `indexedDB`
   * @param request `indexedDB` database opening request
   */
  protected createStore(request: IDBOpenDBRequest): void {

    /* Listen to the event fired on first connection */
    fromEvent(request, 'upgradeneeded')
      /* The observable will complete */
      .pipe(first())
      .subscribe({
        next: () => {

          /* Check if the store already exists, to avoid error */
          if (!request.result.objectStoreNames.contains(this.storeName)) {

            /* Create the object store */
            request.result.createObjectStore(this.storeName);

          }

        }
      });

  }

  /**
   * Open an `indexedDB` transaction and get our store
   * @param mode `readonly` or `readwrite`
   * @returns An `indexedDB` store, wrapped in an RxJS `Observable`
   */
  protected transaction(mode: IDBTransactionMode): Observable<IDBObjectStore> {

    /* From the `indexedDB` connection, open a transaction and get the store */
    return this.database
      .pipe(mergeMap((database) => {

        let store: IDBObjectStore;

        try {

          store = database.transaction([this.storeName], mode).objectStore(this.storeName);

        } catch (error) {

            /* The store could have been deleted from outside */
            return throwError(error as DOMException);

        }

        return of(store);

      }));

  }

  /**
   * Listen to an `indexedDB` success error event
   * @param request Request to listen
   * @returns An RxJS `Observable` listening to the success event
   */
  protected successEvent(request: IDBRequest): Observable<Event> {

    return fromEvent(request, 'success');

  }

  /**
   * Listen to an `indexedDB` request error event
   * @param request Request to listen
   * @returns An RxJS `Observable` listening to the error event and if so, throwing an error
   */
  protected errorEvent(request: IDBRequest): Observable<never> {

    return fromEvent(request, 'error').pipe(mergeMap(() => throwError(request.error as DOMException)));

  }

  /**
   * Listen to an `indexedDB` request success and error event, and map to the wanted value
   * @param request Request to listen
   * @param mapCallback Callback returning the wanted value
   * @returns An RxJS `Observable` listening to request events and mapping to the wanted value
   */
  protected requestEventsAndMapTo<T>(request: IDBRequest, mapCallback: () => T): Observable<T> {

    /* Listen to the success event and map to the wanted value
     * `mapTo()` must not be used here as it would eval `request.result` too soon */
    const success$ = this.successEvent(request).pipe(map(mapCallback));

    /* Listen to the error event */
    const error$ = this.errorEvent(request);

    /* Choose the first event to occur */
    return race([success$, error$]);

  }

}
