import { Injectable, inject } from "@angular/core";
import { Observable, ReplaySubject, fromEvent, of, race, throwError } from "rxjs";
import { first, map, mergeMap, takeWhile, tap } from "rxjs/operators";
import { IDB_DB_NAME, IDB_DB_VERSION, IDB_NO_WRAP, IDB_STORE_NAME } from "../tokens";
import { IDBBrokenError } from "./exceptions";
import { LocalDatabase } from "./local-database";

@Injectable({
  providedIn: "root"
})
export class IndexedDBDatabase implements LocalDatabase {

  /**
   * `indexedDB` database name
   */
  private readonly dbName: string;

  /**
   * `indexedDB` object store name
   */
  private readonly storeName: string;

  /**
   * `indexedDB` database version. Must be an unsigned **integer**
   */
  private readonly dbVersion: number;

  /**
   * `indexedDB` database connection, wrapped in a RxJS `ReplaySubject` to be able to access the connection
   * even after the connection success event happened
   */
  private readonly database = new ReplaySubject<IDBDatabase>(1);

  /**
   * Flag to not wrap `indexedDB` values for interoperability or to wrap for backward compatibility.
   */
  private readonly noWrap: boolean;

  /**
   * Index used when wrapping value. *For backward compatibility only.*
   */
  private readonly wrapIndex = "value";

  constructor() {

    this.dbName = inject(IDB_DB_NAME);
    this.storeName = inject(IDB_STORE_NAME);
    this.dbVersion = inject(IDB_DB_VERSION);
    this.noWrap = inject(IDB_NO_WRAP);

    /* Connect to `indexedDB`, with prefix if provided by the user */
    this.connect();

  }

  /**
   * Information about `indexedDB` connection. *Only useful for interoperability.*
   * @returns `indexedDB` database name, store name and database version
   */
  get backingStore(): { database: string, store: string, version: number; } {

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
    return this.transaction("readonly").pipe(
      mergeMap((transactionData) => {

        const { store, events } = transactionData;

        /* Request to know the number of items */
        const request = store.count();

        /* Return the result */
        return events.pipe(map(() => request.result));

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
  get(key: string): Observable<unknown> {

    /* Open a transaction in read-only mode */
    return this.transaction("readonly").pipe(
      mergeMap((transactionData) => {

        const { store, events } = transactionData;

        /* Request the value with the key provided by the user */
        const request = store.get(key);

        /* Listen events and return the result */
        return events.pipe(map((): unknown => {

          if ((request.result !== undefined) && (request.result !== null)) {

            /* Prior to v8, the value was wrapped in an `{ value: ...}` object */
            if (!this.noWrap && (typeof request.result === "object") && (this.wrapIndex in request.result) &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Required by indexedDb behavior
              (request.result[this.wrapIndex] !== undefined) && (request.result[this.wrapIndex] !== null)) {

              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Required by indexedDb behavior
              return request.result[this.wrapIndex];

            } else {

              /* Cast to the wanted type */
              return request.result;

            }

          }

          /* Return `undefined` if the value is empty */
          return undefined;

        }));

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
  set(key: string, data: unknown): Observable<undefined> {

    /* Storing `undefined` in `indexedDb` can cause issues in some browsers so removing item instead */
    if (data === undefined) {
      return this.delete(key);
    }

    /* Open a transaction in write mode */
    return this.transaction("readwrite").pipe(
      mergeMap((transactionData) => {

        const { store, events } = transactionData;

        /* Prior to v8, data was wrapped in a `{ value: ... }` object */
        const dataToStore = this.noWrap ? data : { [this.wrapIndex]: data };

        /* Add if the item is not existing yet, or update otherwise */
        store.put(dataToStore, key);

        /* Listen to events and return `undefined` as no value is expected */
        return events.pipe(map(() => undefined));

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
    return this.transaction("readwrite").pipe(
      mergeMap((transactionData) => {

        const { store, events } = transactionData;

        /* Delete the item in store */
        store.delete(key);

        /* Listen to events and return `undefined` as no data is expected here */
        return events.pipe(map(() => undefined));

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
    return this.transaction("readwrite").pipe(
      mergeMap((transactionData) => {

        const { store, events } = transactionData;

        /* Delete all items in object store */
        store.clear();

        /* Listen to events and return `undefined` as no data is expected here */
        return events.pipe(map(() => undefined));

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
    return this.transaction("readonly").pipe(
      /* `first()` is used as the final operator in other methods to complete the `Observable`
       * (as it all starts from a `ReplaySubject` which never ends),
       * but as this method is iterating over multiple values, `first()` **must** be used here */
      first(),
      mergeMap((transactionData) => {

        const { store } = transactionData;

        /* Open a cursor on the store
         * Avoid issues like https://github.com/cyrilletuzi/angular-async-local-storage/issues/69 */
        const request = store.openKeyCursor();

        /* Listen to success event */
        const success$ = fromEvent(request, "success").pipe(
          /* Stop the `Observable` when the cursor is `null` */
          // eslint-disable-next-line rxjs/no-ignored-takewhile-value -- Required by indexedDb behavior, getting the result from the event does not always work
          takeWhile(() => (request.result !== null)),
          /* This lib only allows string keys, but user could have added other types of keys from outside
           * It's OK to cast as the cursor as been tested in the previous operator */
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-base-to-string -- Required by indexedDb behavior, and strings are enforced by the lib
          map(() => request.result!.key.toString()),
          /* Iterate on the cursor */
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Required by indexedDb behavior
          tap(() => { request.result!.continue(); }),
        );

        /* Listen to error event and if so, throw an error */
        const error$ = this.listenError(request);

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
    return this.transaction("readonly").pipe(
      mergeMap((transactionData) => {

        const { store, events } = transactionData;

        /* Check if the key exists in the store
         * Fixes https://github.com/cyrilletuzi/angular-async-local-storage/issues/69
         */
        const request = store.getKey(key);

        /* Listen to events and return `true` or `false` */
        return events.pipe(map(() => (request.result !== undefined) ? true : false));

      }),
      /* The observable will complete */
      first(),
    );

  }

  /**
   * Connects to `indexedDB` and creates the object store on first time
   */
  private connect(): void {

    let request: IDBOpenDBRequest;

    /* Connect to `indexedDB`
     * Will fail in Safari cross-origin iframes
     * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/42} */
    try {

      /* Do NOT explicit `window` here, as `indexedDB` could be used from a web worker too */
      request = indexedDB.open(this.dbName, this.dbVersion);

    } catch {

      this.database.error(new IDBBrokenError());

      return;

    }

    /* Create store on first connection */
    this.createStore(request);

    /* Listen to success and error events */
    const success$ = fromEvent(request, "success");
    const error$ = this.listenError(request);

    /* Choose the first to occur */
    race([success$, error$])
      /* The observable will complete */
      .pipe(first())
      .subscribe({
        next: () => {
          /* Register the database connection in the `ReplaySubject` for further access */
          this.database.next(request.result);
        },
        error: () => {
          /* Keeping this error management for safety, but it should not happen anymore.
           * It was for Firefox private mode issue in Firefox versions < 115
           * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/26} */
          this.database.error(new IDBBrokenError());
        },
      });

  }

  /**
   * Create store on first use of `indexedDB`
   * @param request `indexedDB` database opening request
   */
  private createStore(request: IDBOpenDBRequest): void {

    /* Listen to the event fired on first connection */
    fromEvent(request, "upgradeneeded")
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
   * @returns An `indexedDB` transaction store and events, wrapped in an RxJS `Observable`
   */
  private transaction(mode: IDBTransactionMode): Observable<{
    store: IDBObjectStore;
    events: Observable<Event>;
  }> {

    /* From the `indexedDB` connection, open a transaction and get the store */
    return this.database
      .pipe(mergeMap((database) => {

        let transaction: IDBTransaction;

        try {

          transaction = database.transaction([this.storeName], mode);

        } catch (error) {

          /* The store could have been deleted from outside */
          return throwError(() => error as DOMException);

        }

        /* Get the store from the transaction */
        const store = transaction.objectStore(this.storeName);

        /* Listen transaction `complete` and `error` events */
        const events = this.listenTransactionEvents(transaction);

        return of({ store, events });

      }));

  }

  /**
   * Listen errors on a transaction or request, and throw if trigerred
   * @param transactionOrRequest `indexedDb` transaction or request to listen
   * @returns An `Observable` listening to errors
   */
  private listenError(transactionOrRequest: IDBTransaction | IDBRequest): Observable<never> {

    return fromEvent(transactionOrRequest, "error").pipe(
      /* Throw on error to be able to catch errors in RxJS way.
       * Here `event.target` must be used, as `transactionOrRequest.error` will be `null`
       * if we are on the request and the error is only triggered later by the transaction */
      mergeMap((event) => throwError(() => (event.target as IDBTransaction | IDBRequest | null)?.error)),
    );

  }

  /**
   * Listen transaction `complete` and `error` events
   * @param transaction Transaction to listen
   * @returns An `Observable` listening to transaction `complete` and `error` events
   */
  private listenTransactionEvents(transaction: IDBTransaction): Observable<Event> {

    /* Listen to the `complete` event */
    const complete$ = fromEvent(transaction, "complete");

    /* Listen to the `error` event */
    const error$ = this.listenError(transaction);

    /* Choose the first event to occur */
    return race([complete$, error$]);

  }

}
