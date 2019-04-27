import { Injectable, Inject } from '@angular/core';
import { Observable, throwError, of, OperatorFunction, ReplaySubject } from 'rxjs';
import { mergeMap, catchError, tap } from 'rxjs/operators';

import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf, ValidationError, JSONValidator
} from '../validation';
import { LocalDatabase, IDB_BROKEN_ERROR, LocalStorageDatabase } from '../databases';
import { LS_PREFIX, LOCAL_STORAGE_PREFIX } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class StorageMap {

  private notifiers = new Map<string, ReplaySubject<any>>();

  /**
   * Number of items in storage
   */
  get size(): Observable<number> {

    return this.database.size;

  }

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
   * Get an item value in storage.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
   * @param key The item's key
   * @param schema Optional JSON schema to validate the data
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS `Observable`
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
   * Set an item in storage
   * @param key The item's key
   * @param data The item's value
   * @param schema Optional JSON schema to validate the data
   * @returns A RxJS `Observable` to wait the end of the operation
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

    return this.database.set(key, data).pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.set(key, data)),
      /* Notify watchers (must be last because it should only happen if the operation succeeds) */
      tap(() => { this.notify(key, data); }),
    );

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  delete(key: string): Observable<undefined> {

    return this.database.delete(key).pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.delete(key)),
      /* Notify watchers (must be last because it should only happen if the operation succeeds) */
      tap(() => { this.notify(key, undefined); }),
    );

  }

  /**
   * Delete all items in storage
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<undefined> {

    return this.database.clear().pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.clear()),
      /* Notify watchers (must be last because it should only happen if the operation succeeds) */
      tap(() => {
        for (const key of this.notifiers.keys()) {
          this.notify(key, undefined);
        }
      }),
    );

  }

  /**
   * Get all keys stored in storage
   * @returns A list of the keys wrapped in a RxJS `Observable`
   */
  keys(): Observable<string> {

    return this.database.keys()
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.keys()));

  }

  /**
   * Tells if a key exists in storage
   * @returns A RxJS `Observable` telling if the key exists
   */
  has(key: string): Observable<boolean> {

    return this.database.has(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.has(key)));

  }

  /**
   * Watch an item value in storage.
   * **Note only changes done via this lib will be watched**, external changes in storage can't be detected.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
   * @param key The item's key to watch
   * @param schema Optional JSON schema to validate the initial value
   * @returns An infinite `Observable` giving the current value
   */
  watch<T = string>(key: string, schema: JSONSchemaString): Observable<string | undefined>;
  watch<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<number | undefined>;
  watch<T = boolean>(key: string, schema: JSONSchemaBoolean): Observable<boolean | undefined>;
  watch<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<string[] | undefined>;
  watch<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<number[] | undefined>;
  watch<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<boolean[] | undefined>;
  watch<T = any>(key: string, schema: JSONSchema): Observable<T | undefined>;
  watch<T = unknown>(key: string, schema?: null | undefined): Observable<unknown>;
  watch<T = any>(key: string, schema: JSONSchema | null | undefined = null) {

    /* Check if there is already a notifier and cast according to schema */
    let notifier = this.notifiers.get(key) as ReplaySubject<typeof schema extends JSONSchema ? (T | undefined) : unknown>;

    if (!notifier) {

      /* Create a notifier and cast according to schema */
      notifier = new ReplaySubject<typeof schema extends JSONSchema ? (T | undefined) : unknown>(1);

      /* Memorize the notifier */
      this.notifiers.set(key, notifier);

      /* Get the current item value */
      (schema ? this.get<T>(key, schema) : this.get(key)).subscribe({
        next: (result) => notifier.next(result),
        error: (error) => notifier.error(error),
      });

    }

    /* Only the public API of the `Observable` should be returned */
    return notifier.asObservable();

  }

  /**
   * Notify when a value changes
   * @param key The item's key
   * @param data The new value
   */
  private notify(key: string, value: any): void {

    const notifier = this.notifiers.get(key);

    if (notifier) {
      notifier.next(value);
    }

  }

  /**
   * RxJS operator to catch if `indexedDB` is broken
   * @param operationCallback Callback with the operation to redo
   */
  private catchIDBBroken<T>(operationCallback: () => Observable<T>): OperatorFunction<T, T> {

    return catchError((error) => {

      /* Check if `indexedDB` is broken based on error message (the specific error class seems to be lost in the process) */
      if ((error !== undefined) && (error !== null) && (error.message === IDB_BROKEN_ERROR)) {

        /* Fallback to `localStorage` */
        this.database = new LocalStorageDatabase(this.LSPrefix, this.oldPrefix);

        /* Redo the operation */
        return operationCallback();

      } else {

        /* Otherwise, rethrow the error */
        return throwError(error);

      }

    });

  }

}
