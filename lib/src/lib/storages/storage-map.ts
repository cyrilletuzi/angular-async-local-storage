import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, of, throwError, type OperatorFunction } from "rxjs";
import { catchError, mergeMap, tap } from "rxjs/operators";
import { IDB_BROKEN_ERROR } from "../databases/exceptions";
import { IndexedDBDatabase } from "../databases/indexeddb-database";
import { LocalDatabase } from "../databases/local-database";
import { LocalStorageDatabase } from "../databases/localstorage-database";
import { MemoryDatabase } from "../databases/memory-database";
import type {
  JSONSchema,
  JSONSchemaArrayOf,
  JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString
} from "../validation/json-schema";
import { JSONValidator } from "../validation/json-validator";
import { ValidationError } from "./exceptions";

@Injectable({
  providedIn: "root"
})
export class StorageMap {

  #database: LocalDatabase;
  readonly #jsonValidator: JSONValidator;
  readonly #notifiers = new Map<string, ReplaySubject<unknown>>();

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param database Storage to use
   */
  constructor(
    // eslint-disable-next-line @angular-eslint/prefer-inject -- Used in tests
    database: LocalDatabase,
  ) {
    this.#database = database;
    this.#jsonValidator = new JSONValidator();
  }

  /**
   * **Number of items** in storage, wrapped in an Observable.
   * 
   * Note you do *not* need to unsubscribe (it is a self-completing Observable).
   *
   * @example
   * this.storageMap.size.subscribe((size) => {
   *   console.log(size);
   * });
   */
  get size(): Observable<number> {

    return this.#database.size
      /* Catch if `indexedDb` is broken */
      .pipe(this.#catchIDBBroken(() => this.#database.size));

  }

  /**
   * Tells you which storage engine is used.
   * 
   * *Only useful for interoperability.*
   * 
   * Note that due to some browsers issues in some special contexts
   * (like Safari cross-origin iframes),
   * **this information may be wrong at initialization,**
   * as the storage could fallback from `indexedDB` to `localStorage`
   * only after a first read or write operation.
   * @returns Storage engine used
   *
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/INTEROPERABILITY.md}
   *
   * @example
   * if (this.storageMap.backingEngine === 'indexedDB') {}
   */
  get backingEngine(): "indexedDB" | "localStorage" | "memory" | "unknown" {

    if (this.#database instanceof IndexedDBDatabase) {

      return "indexedDB";

    } else if (this.#database instanceof LocalStorageDatabase) {

      return "localStorage";

    } else if (this.#database instanceof MemoryDatabase) {

      return "memory";

    } else {

      return "unknown";

    }

  }

  /**
   * Information about `indexedDB` database.
   * 
   * *Only useful for interoperability.*
   * 
   * @returns `indexedDB` database name, store name and database version.
   * **Values will be empty if the storage is not `indexedDB`, so it should be used after an engine check**.
   *
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/INTEROPERABILITY.md}
   *
   * @example
   * if (this.storageMap.backingEngine === 'indexedDB') {
   *   const { database, store, version } = this.storageMap.backingStore;
   * }
   */
  get backingStore(): { database: string, store: string, version: number; } {

    return (this.#database instanceof IndexedDBDatabase) ?
      this.#database.backingStore :
      { database: "", store: "", version: 0 };

  }

  /**
   * Information about `localStorage` fallback storage.
   * 
   * *Only useful for interoperability.*
   * 
   * @returns `localStorage` prefix.
   * **Values will be empty if the storage is not `localStorage`, so it should be used after an engine check**.
   *
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/INTEROPERABILITY.md}
   *
   * @example
   * if (this.storageMap.backingEngine === 'localStorage') {
   *   const { prefix } = this.storageMap.fallbackBackingStore;
   * }
   */
  get fallbackBackingStore(): { prefix: string; } {

    return (this.#database instanceof LocalStorageDatabase) ?
      { prefix: this.#database.prefix } :
      { prefix: "" };

  }

  /**
   * Get an item value in storage.
   * 
   * Note that:
   * * not finding an item is not an error, it succeeds but returns `undefined`,
   * * you do *not* need to unsubscribe (it is a self-completing Observable),
   * * you will only get *one* value: the Observable is here for asynchrony but is *not* meant to emit again when the stored data is changed. If you need to watch the value, see the `watch` method.
   * 
   * Do not forget it is client-side storage: **always check the data**, as it could have been forged.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md}
   * 
   * @param key The item's key
   * @param schema Optional but recommended JSON schema to validate the data
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS Observable
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
   *   required: ['firstName'],
   * } satisfies JSONSchema;
   *
   * this.storageMap.get<User>('user', schema).subscribe((user) => {
   *   if (user) {
   *     user.firstName;
   *   }
   * });
   */
  get(key: string): Observable<unknown>;
  get<T extends string = string>(key: string, schema: JSONSchemaString): Observable<T | undefined>;
  get<T extends number = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<T | undefined>;
  get<T extends boolean = boolean>(key: string, schema: JSONSchemaBoolean): Observable<T | undefined>;
  get<T extends readonly string[] = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<T | undefined>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Better for documentation
  get<T extends readonly number[] = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<T | undefined>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Better for documentation
  get<T extends readonly boolean[] = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<T | undefined>;
  get<T>(key: string, schema: JSONSchema): Observable<T | undefined>;
  get<T = unknown>(key: string, schema?: JSONSchema): Observable<unknown> {

    /* Get the data in storage */
    return this.#database.get(key).pipe(
      /* Check if `indexedDb` is broken */
      this.#catchIDBBroken(() => this.#database.get(key)),
      mergeMap((data) => {

        /* No need to validate if the data is empty */
        if ((data === undefined) || (data === null)) {

          return of(undefined);

        } else if (schema) {

          /* Validate data against a JSON schema if provided */
          if (!this.#jsonValidator.validate(data, schema)) {
            return throwError(() => new ValidationError());
          }

          /* Data have been checked, so it's OK to cast */
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          return of(data as T | undefined);

        }

        /* Cast to unknown as the data wasn't checked */
        return of(data);

      }),
    );

  }

  /**
   * Store an item in storage.
   * 
   * Note that:
   * * you *do* need to subscribe, even if you do not have something specific to do after writing in storage, otherwise nothing happens (because it is how RxJS Observables work),
   * * but you do *not* need to unsubscribe (it is a self-completing Observable),
   * * setting `null` or `undefined` will remove the item to avoid some browsers issues,
   * * you should stick to serializable JSON data, meaning primitive types, arrays and literal objects. Date, Map, Set, Blob and other special structures can cause issues in some scenarios.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/SERIALIZATION.md}
   * 
   * @param key The item's key
   * @param data The item's value
   * @param schema Optional JSON schema to validate the data
   * @returns A RxJS Observable to wait the end of the operation
   *
   * @example
   * this.storageMap.set('key', 'value').subscribe(() => {});
   */
  set(key: string, data: unknown, schema?: JSONSchema): Observable<undefined> {

    /* Storing `undefined` or `null` is useless and can cause issues in `indexedDb` in some browsers,
     * so removing item instead for all storages to have a consistent API */
    if ((data === undefined) || (data === null)) {
      return this.delete(key);
    }

    /* Validate data against a JSON schema if provided */
    if (schema && !this.#jsonValidator.validate(data, schema)) {
      return throwError(() => new ValidationError());
    }

    return this.#database.set(key, data).pipe(
      /* Catch if `indexedDb` is broken */
      this.#catchIDBBroken(() => this.#database.set(key, data)),
      /* Notify watchers (must be last because it should only happen if the operation succeeds) */
      tap(() => { this.#notify(key, data); }),
    );
  }

  /**
   * Delete an item in storage.
   * 
   * Note that:
   * * you *do* need to subscribe, even if you do not have something specific to do after deleting, otherwise nothing happens (because it is how RxJS Observables work),
   * * but you do *not* need to unsubscribe (it is a self-completing Observable).
   * 
   * @param key The item's key
   * @returns A RxJS Observable to wait the end of the operation
   *
   * @example
   * this.storageMap.delete('key').subscribe(() => {});
   */
  delete(key: string): Observable<undefined> {

    return this.#database.delete(key).pipe(
      /* Catch if `indexedDb` is broken */
      this.#catchIDBBroken(() => this.#database.delete(key)),
      /* Notify watchers (must be last because it should only happen if the operation succeeds) */
      tap(() => { this.#notify(key, undefined); }),
    );

  }

  /**
   * Delete all items in storage.
   * 
   * Note that:
   * * you *do* need to subscribe, even if you do not have something specific to do after clearing, otherwise nothing happens (because it is how RxJS Observables work),
   * * but you do *not* need to unsubscribe (it is a self-completing Observable).
   * 
   * @returns A RxJS Observable to wait the end of the operation
   *
   * @example
   * this.storageMap.clear().subscribe(() => {});
   */
  clear(): Observable<undefined> {

    return this.#database.clear().pipe(
      /* Catch if `indexedDb` is broken */
      this.#catchIDBBroken(() => this.#database.clear()),
      /* Notify watchers (must be last because it should only happen if the operation succeeds) */
      tap(() => {
        for (const key of this.#notifiers.keys()) {
          this.#notify(key, undefined);
        }
      }),
    );

  }

  /**
   * Get all keys stored in storage.
   * 
   * Note **this is an *iterating* Observable**:
   * * if there is no key, the `next` callback will not be invoked,
   * * if you need to wait the whole operation to end, be sure to act in the `complete` callback,
   * as this Observable can emit several values and so will invoke the `next` callback several times,
   * * you do *not* need to unsubscribe (it is a self-completing Observable).
   * 
   * @returns A list of the keys wrapped in a RxJS Observable
   *
   * @example
   * this.storageMap.keys().subscribe({
   *   next: (key) => { console.log(key); },
   *   complete: () => { console.log('Done'); },
   * });
   */
  keys(): Observable<string> {

    return this.#database.keys()
      /* Catch if `indexedDb` is broken */
      .pipe(this.#catchIDBBroken(() => this.#database.keys()));

  }

  /**
   * Tells if a key exists in storage.
   * 
   * Note you do *not* need to unsubscribe (it is a self-completing Observable).
   * 
   * @returns A RxJS Observable telling if the key exists
   *
   * @example
   * this.storageMap.has('key').subscribe((hasKey) => {
   *   if (hasKey) {}
   * });
   */
  has(key: string): Observable<boolean> {

    return this.#database.has(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.#catchIDBBroken(() => this.#database.has(key)));

  }

  /**
   * Watch an item value in storage.
   * 
   * Note that:
   * * it is an infinite Observable, do not forget to unsubscribe,
   * * only changes done via this library will be watched, external changes in storage cannot be detected.
   * 
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md
   * 
   * @param key The item's key to watch
   * @param schema Optional JSON schema to validate the initial value
   * @returns An infinite Observable giving the current value
   * 
   * @example
   * Component()
   * export class MyComponent implements OnInit, OnDestroy {
   * 
   *   private storageSubscription?: Subscription;
   * 
   *   ngOnInit(): void {
   *     this.storageSubscription = this.storageMap.watch('key', { type: 'string' }).subscribe((result) => {
   *       result; // string or undefined
   *     });
   *   }
   * 
   *   ngOnDestroy(): void {
   *     this.storageSubscription?.unsubscribe();
   *   }
   * 
   * }
   */
  watch(key: string): Observable<unknown>;
  watch<T extends string = string>(key: string, schema: JSONSchemaString): Observable<T | undefined>;
  watch<T extends number = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<T | undefined>;
  watch<T extends boolean = boolean>(key: string, schema: JSONSchemaBoolean): Observable<T | undefined>;
  watch<T extends readonly string[] = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<T | undefined>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Better for documentation
  watch<T extends readonly number[] = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<T | undefined>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Better for documentation
  watch<T extends readonly boolean[] = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<T | undefined>;
  watch<T>(key: string, schema: JSONSchema): Observable<T | undefined>;
  watch<T = unknown>(key: string, schema?: JSONSchema): Observable<unknown> {

    /* Check if there is already a notifier */
    if (!this.#notifiers.has(key)) {
      this.#notifiers.set(key, new ReplaySubject(1));
    }

    /* Non-null assertion is required because TypeScript doesn't narrow `.has()` yet */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Ensured by the logic
    const notifier = this.#notifiers.get(key)!;

    /* Get the current item value */
    (schema ? this.get<T>(key, schema) : this.get(key)).subscribe({
      next: (result) => {
        notifier.next(result);
      },
      error: (error) => {
        notifier.error(error);
      },
    });

    /* Only the public API of the Observable should be returned */
    return (schema ?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      notifier.asObservable() as Observable<T | undefined> :
      notifier.asObservable()
    );

  }

  /**
   * Notify when a value changes
   * @param key The item's key
   * @param data The new value
   */
  #notify(key: string, value: unknown): void {

    const notifier = this.#notifiers.get(key);

    if (notifier) {
      notifier.next(value);
    }

  }

  /**
   * RxJS operator to catch if `indexedDB` is broken
   * @param operationCallback Callback with the operation to redo
   */
  #catchIDBBroken<T>(operationCallback: () => Observable<T>): OperatorFunction<T, T> {

    return catchError((error) => {

      /* Check if `indexedDB` is broken based on error message (the specific error class seems to be lost in the process) */
      if ((error !== undefined) && (error !== null)
        && (typeof error === "object") && ("message" in error)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Required because TypeScript narrowing is not working here
        && (error.message === IDB_BROKEN_ERROR)) {

        /* When storage is fully disabled in browser (via the "Block all cookies" option),
         * just trying to check `localStorage` variable causes a security exception.
         * Prevents https://github.com/cyrilletuzi/angular-async-local-storage/issues/118
         */
        try {

          if ("getItem" in localStorage) {

            /* Fallback to `localStorage` if available */
            this.#database = new LocalStorageDatabase();

          } else {

            /* Fallback to memory storage otherwise */
            this.#database = new MemoryDatabase();

          }

        } catch {

          /* Fallback to memory storage otherwise */
          this.#database = new MemoryDatabase();

        }

        /* Redo the operation */
        return operationCallback();

      } else {

        /* Otherwise, rethrow the error */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return throwError(() => error);

      }

    });

  }

  /**
   * THIS METHOD IS FOR INTERNAL PURPOSE ONLY AND MUST NOT BE USED,
   * IT CAN BE REMOVED AT ANY TIME AND MESSING WITH IT CAN CAUSE ISSUES
   * @private
   * @ignore
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Silence the not used error, it is used in tests
  // @ts-ignore
  private ɵinternalGetDatabase(): LocalDatabase {

    return this.#database;

  }

}
