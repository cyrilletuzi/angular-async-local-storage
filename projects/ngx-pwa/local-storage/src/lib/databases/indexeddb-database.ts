import { Injectable, Optional, Inject } from '@angular/core';
import { Observable, ReplaySubject, fromEvent, of, throwError, race } from 'rxjs';
import { map, mergeMap, first, tap, filter } from 'rxjs/operators';

import { LocalDatabase } from './local-database';
import { PREFIX, IDB_DB_NAME, DEFAULT_IDB_DB_NAME, IDB_STORE_NAME, DEFAULT_IDB_STORE_NAME } from '../tokens';
import { IDBBrokenError } from '../exceptions';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBDatabase implements LocalDatabase {

  /**
   * `indexedDB` database name
   */
  protected dbName: string;

  /**
   * `indexedDB` object store name
   */
  protected storeName: string;

  /**
   * `indexedDB` data path name for local storage (where items' value will be stored)
   */
  private readonly dataPath = 'value';

  /**
   * `indexedDB` database connection, wrapped in a RxJS `ReplaySubject` to be able to access the connection
   * even after the connection success event happened
   */
  private database: ReplaySubject<IDBDatabase>;

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
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param prefix Optional user prefix to avoid collision for multiple apps on the same subdomain
   * @param dbName `indexedDB` database name
   * @param storeName `indexedDB` store name
   */
  constructor(
    @Optional() @Inject(PREFIX) prefix: string | null = null,
    @Optional() @Inject(IDB_DB_NAME) dbName = DEFAULT_IDB_DB_NAME,
    @Optional() @Inject(IDB_STORE_NAME) storeName = DEFAULT_IDB_STORE_NAME,
  ) {

    /* Initialize `indexedDB` database name, with prefix if provided by the user */
    this.dbName = prefix ? `${prefix}_${dbName}` : dbName;

    /* Initialize `indexedDB` store name */
    this.storeName = storeName;

    /* Creating the RxJS ReplaySubject */
    this.database = new ReplaySubject<IDBDatabase>();

    /* Connect to `indexedDB`, with prefix if provided by the user */
    this.connect();

  }

  /**
   * Gets an item value in our `indexedDB` store
   * @param key The item's key
   * @returns The item's value if the key exists, `null` otherwise, wrapped in an RxJS `Observable`
   */
  getItem<T = any>(key: string): Observable<T | null> {

    /* Open a transaction in read-only mode */
    return this.transaction('readonly').pipe(
      mergeMap((store) => {

        /* Request the value with the key provided by the user */
        const request = store.get(key);

        /* Manage success and error events, and get the result */
        return this.requestEventsAndMapTo(request, () => {

          /* Currently, the lib is wrapping the value in a `{ value: ... }` object, so test this case */
          // TODO: add a check to see if the object has only one key
          // TODO: stop wrapping
          if ((request.result !== undefined)
          && (request.result !== null)
          && (typeof request.result === 'object')
          && (this.dataPath in request.result)
          && (request.result[this.dataPath] !== undefined)
          && (request.result[this.dataPath] !== null)) {

            /* If so, unwrap the value and cast it to the wanted type */
            return (request.result[this.dataPath] as T);

          } else if ((request.result !== undefined) && (request.result !== null)) {

            /* Otherwise, return the value directly, casted to the wanted type */
            return request.result as T;

          }

          /* Return `null` if the value is `null` or `undefined` */
          return null;

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
  setItem(key: string, data: string | number | boolean | object): Observable<boolean> {

    /* Storing `null` or `undefined` is known to cause issues in some browsers.
     * So it's useless, not storing anything in this case */
    if ((data === undefined) || (data === null)) {

      /* Trigger success */
      return of(true);

    }

    /* Open a transaction in write mode */
    return this.transaction('readwrite').pipe(
      mergeMap((store) => {

        /* Check if the key already exists or not
         * `getKey()` is better but only available in `indexedDB` v2 (Chrome >= 58, missing in IE/Edge).
         * In older browsers, the value is checked instead, but it could lead to an exception
         * if `undefined` was stored outside of this lib (e.g. directly with the native `indexedDB` API).
         */
        const request1 = this.getKeyRequest(store, key);

        /* Manage success and error events, and get the request result */
        return this.requestEventsAndMapTo(request1, () => request1.result).pipe(
          mergeMap((existingEntry) => {

            /* It is very important the second request is done from the same transaction/store as the previous one,
             * otherwise it could lead to concurrency failures
             * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/47 */

            /* Add if the item is not existing yet, or update otherwise */
            // TODO: stop wrapping
            const request2 = (existingEntry === undefined) ?
              store.add({ [this.dataPath]: data }, key) :
              store.put({ [this.dataPath]: data }, key);

            /* Manage success and error events, and map to `true` */
            return this.requestEventsAndMapTo(request2, () => true);

          }),
        );
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
  removeItem(key: string): Observable<boolean> {

    /* Open a transaction in write mode */
    return this.transaction('readwrite').pipe(
      mergeMap((store) => {

        /* Deletethe item in store */
        const request = store.delete(key);

        /* Manage success and error events, and map to `true` */
        return this.requestEventsAndMapTo(request, () => true);

      }),
      /* The observable will complete after the first value */
      first()
    );

  }

  /**
   * Deletes all items from our `indexedDB` objet store
   * @returns An RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<boolean> {

    /* Open a transaction in write mode */
    return this.transaction('readwrite').pipe(
      mergeMap((store) => {

        /* Delete all items in object store */
        const request = store.clear();

        /* Manage success and error events, and map to `true` */
        return this.requestEventsAndMapTo(request, () => true);

      }),
      /* The observable will complete */
      first(),
    );

  }

  /**
   * Get all the keys in our `indexedDB` store
   * @returns An RxJS `Observable` containing all the keys
   */
  keys(): Observable<string[]> {

    /* Open a transaction in read-only mode */
    return this.transaction('readonly').pipe(
      mergeMap((store) => {

        if ('getAllKeys' in store) {

          /* Request all keys in store */
          const request = store.getAllKeys();

          /* Manage success and error events, and map to result
           * This lib only allows string keys, but user could have added other types of keys from outside */
          return this.requestEventsAndMapTo(request, () => request.result.map((key) => key.toString())) ;

        } else {

          /* `getAllKey()` is better but only available in `indexedDB` v2 (Chrome >= 58, missing in IE/Edge)
           * Fixes https://github.com/cyrilletuzi/angular-async-local-storage/issues/69 */

          /* Open a cursor on the store */
          const request = (store as IDBObjectStore).openCursor();

          /* Listen to success event */
          const success$ = this.getKeysFromCursor(request);

          /* Listen to error event and if so, throw an error */
          const error$ = this.errorEvent(request);

          /* Choose the first event to occur */
          return race([success$, error$]);

        }

      }),
      /* The observable will complete */
      first(),
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

        /* Check if the key exists in the store */
        const request = this.getKeyRequest(store, key);

        /* Manage success and error events, and map to a boolean based on the existence of the key */
        return this.requestEventsAndMapTo(request, () => (request.result !== undefined) ? true : false);

      }),
      /* The observable will complete */
      first()
    );

  }

  /**
   * Connects to `indexedDB` and creates the object store on first time
   * @param prefix
   */
  private connect(): void {

    let request: IDBOpenDBRequest;

    /* Connect to `indexedDB`
     * Will fail in Safari cross-origin iframes
     * @see https://github.com/cyrilletuzi/angular-async-local-storage/issues/42 */
    try {

      /* Do NOT explicit `window` here, as `indexedDB` could be used from a web worker too */
      request = indexedDB.open(this.dbName);

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
      .subscribe(() => {

        /* Register the database connection in the `ReplaySubject` for further access */
        this.database.next(request.result);

      }, () => {

        /* Firefox private mode issue: fallback storage if IndexedDb connection is failing
         * @see https://bugzilla.mozilla.org/show_bug.cgi?id=781982
         * @see https://github.com/cyrilletuzi/angular-async-local-storage/issues/26 */
         this.database.error(new IDBBrokenError());

      });

  }

  /**
   * Create store on first use of `indexedDB`
   * @param request `indexedDB` database opening request
   */
  private createStore(request: IDBOpenDBRequest): void {

    /* Listen to the event fired on first connection */
    fromEvent(request, 'upgradeneeded')
      /* The observable will complete */
      .pipe(first())
      .subscribe(() => {

        /* Check if the store already exists, to avoid error */
        if (!request.result.objectStoreNames.contains(this.storeName)) {

          /* Create the object store */
          request.result.createObjectStore(this.storeName);

        }

      });

  }

  /**
   * Open an `indexedDB` transaction and get our store
   * @param mode `readonly` or `readwrite`
   * @returns An `indexedDB` store, wrapped in an RxJS `Observable`
   */
  private transaction(mode: IDBTransactionMode): Observable<IDBObjectStore> {

    // TODO: could the store be missing?
    /* From the `indexedDB` connection, open a transaction and get the store */
    return this.database
      .pipe(map((database) => database.transaction([this.storeName], mode).objectStore(this.storeName)));

  }

  /**
   * Listen to an `indexedDB` success error event
   * @param request Request to listen
   * @returns An RxJS `Observable` listening to the success event
   */
  private successEvent(request: IDBRequest): Observable<Event> {

    return fromEvent(request, 'success');

  }

  /**
   * Listen to an `indexedDB` request error event
   * @param request Request to listen
   * @returns An RxJS `Observable` listening to the error event and if so, throwing an error
   */
  private errorEvent(request: IDBRequest): Observable<never> {

    return fromEvent(request, 'error').pipe(mergeMap(() => throwError(request.error as DOMException)));

  }

  /**
   * Listen to an `indexedDB` request success and error event, and map to the wanted value
   * @param request Request to listen
   * @param mapCallback Callback returning the wanted value
   * @returns An RxJS `Observable` listening to request events and mapping to the wanted value
   */
  private requestEventsAndMapTo<T>(request: IDBRequest, mapCallback: () => T): Observable<T> {

    /* Listen to the success event and map to the wanted value
     * `mapTo()` must not be used here as it would eval `request.result` too soon */
    const success$ = this.successEvent(request).pipe(map(mapCallback));

    /* Listen to the error event */
    const error$ = this.errorEvent(request);

    /* Choose the first event to occur */
    return race([success$, error$]);

  }

  /**
   * Check if the key exists in the store
   * @param store Objet store on which to perform the request
   * @param key Key to check
   * @returns An `indexedDB` request
   */
  private getKeyRequest(store: IDBObjectStore, key: string): IDBRequest {

    /* `getKey()` is better but only available in `indexedDB` v2 (Chrome >= 58, missing in IE/Edge).
     * In older browsers, the value is checked instead, but it could lead to an exception
     * if `undefined` was stored outside of this lib (e.g. directly with the native `indexedDB` API).
     * Fixes https://github.com/cyrilletuzi/angular-async-local-storage/issues/69
     */
    return ('getKey' in store) ? store.getKey(key) : (store as IDBObjectStore).get(key);

  }

  /**
   * Get all keys from store from a cursor, for older browsers still in `indexedDB` v1
   * @param request Request containing the cursor
   */
  private getKeysFromCursor(request: IDBRequest<IDBCursorWithValue | null>): Observable<string[]> {

    /* Keys will be stored here */
    const keys: string[] = [];

    /* Listen to success event */
    return this.successEvent(request).pipe(
      /* Map to the result */
      map(() => request.result),
      /* Iterate on the cursor */
      tap((cursor) =>  {

        if (cursor) {

          /* This lib only allows string keys, but user could have added other types of keys from outside */
          keys.push(cursor.key.toString());

          cursor.continue();

        }

      }),
      /* Wait until the iteration is over */
      filter((cursor) => !cursor),
      /* Map to the retrieved keys */
      map(() => keys)
    );

  }

}
