import { Injectable, Optional, Inject } from '@angular/core';
import { Observable, throwError, of, OperatorFunction } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { LocalDatabase } from './databases/local-database';
import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf
} from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';
import { IDB_BROKEN_ERROR, ValidationError } from './exceptions';
import { LocalStorageDatabase } from './databases/localstorage-database';
import { PREFIX } from './tokens';

export interface LSGetItemOptions {
  /**
   * Subset of the JSON Schema standard.
   * Types are enforced to validate everything: each value **must** have a `type`.
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
   */
  schema?: JSONSchema | null;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorage {

  /**
   * Number of items in storage
   */
  get size(): Observable<number> {

    return this.database.size;

  }

  /**
   * Default options for `getItem()`
   */
  private readonly getItemOptionsDefault: LSGetItemOptions = {
    schema: null,
  };

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param database Storage to use
   * @param jsonValidator Validator service
   * @param prefix Optional user prefix to avoid collision for multiple apps on the same subdomain
   */
  constructor(
    private database: LocalDatabase,
    private jsonValidator: JSONValidator,
    @Optional() @Inject(PREFIX) protected prefix: string | null = null,
  ) {}

  /**
   * Get an item value in storage.
   * The signature has many overloads due to validation, please refer to the documentation.
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
   * @param key The item's key
   * @returns The item's value if the key exists, `null` otherwise, wrapped in a RxJS `Observable`
   */
  getItem<T = string>(key: string, options: LSGetItemOptions &
    { schema: JSONSchemaString }): Observable<string | null>;
  getItem<T = number>(key: string, options: LSGetItemOptions &
    { schema: JSONSchemaInteger | JSONSchemaNumber }): Observable<number | null>;
  getItem<T = boolean>(key: string, options: LSGetItemOptions &
    { schema: JSONSchemaBoolean }): Observable<boolean | null>;
  getItem<T = string[]>(key: string, options: LSGetItemOptions &
    { schema: JSONSchemaArrayOf<JSONSchemaString> }): Observable<string[] | null>;
  getItem<T = number[]>(key: string, options: LSGetItemOptions &
    { schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber> }): Observable<number[] | null>;
  getItem<T = boolean[]>(key: string, options: LSGetItemOptions &
    { schema: JSONSchemaArrayOf<JSONSchemaBoolean> }): Observable<boolean[] | null>;
  getItem<T = any>(key: string, options: LSGetItemOptions & { schema: JSONSchema }): Observable<T | null>;
  getItem<T = any>(key: string, options?: LSGetItemOptions): Observable<unknown>;
  getItem<T = any>(key: string, options = this.getItemOptionsDefault) {

    /* Get the data in storage */
    return this.database.getItem<T>(key).pipe(
      /* Check if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.getItem<T>(key)),
      mergeMap((data) => {

        if (data === null) {

          /* No need to validate if the data is `null` */
          return of(null);

        } else if (options.schema) {

          /* Validate data against a JSON schema if provied */
          if (!this.jsonValidator.validate(data, options.schema)) {
            return throwError(new ValidationError());
          }

        }

        // TODO: check it'll stay ok
        /* Cast to unknown (will be overrided if a schema was provided) */
        return of(data as unknown);

      }),
    );

  }

  /**
   * Get an item value in storage *without* any validation
   * It is a convenience method for development only: **do not use it in production code**,
   * as it can cause security issues and errors.
   * @ignore Use the `.getItem()` method instead.
   * @deprecated May be removed in future versions.
   * @param key The item's key
   * @returns The item's value if the key exists, `null` otherwise, wrapped in a RxJS `Observable`
   */
  getUnsafeItem<T = any>(key: string): Observable<T | null> {

    return this.database.getItem<T>(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.getItem<T>(key)));

  }

  /**
   * Set an item in storage
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  setItem(key: string, data: string | number | boolean | object): Observable<boolean> {

    return this.database.setItem(key, data)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.setItem(key, data)));

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    return this.database.removeItem(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.removeItem(key)));

  }

  /**
   * Delete all items in storage
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<boolean> {

    return this.database.clear()
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.clear()));

  }

  /**
   * Get all keys stored in storage
   * @returns A list of the keys wrapped in a RxJS `Observable`
   */
  keys(): Observable<string[]> {

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
   * Set an item in storage, and auto-subscribe
   * @param key The item's key
   * @param data The item's value
   * **WARNING: should be avoided in most cases, use this method only if these conditions are fulfilled:**
   * - you don't need to manage the error callback (errors will silently fail),
   * - you don't need to wait the operation to finish before the next one (remember, it's asynchronous).
   */
  setItemSubscribe(key: string, data: string | number | boolean | object): void {

    this.setItem(key, data).subscribe(() => {}, () => {});

  }

  /**
   * Delete an item in storage, and auto-subscribe
   * @param key The item's key
   * **WARNING: should be avoided in most cases, use this method only if these conditions are fulfilled:**
   * - you don't need to manage the error callback (errors will silently fail),
   * - you don't need to wait the operation to finish before the next one (remember, it's asynchronous).
   */
   removeItemSubscribe(key: string): void {

    this.removeItem(key).subscribe(() => {}, () => {});

  }

  /**
   * Delete all items in storage, and auto-subscribe
   * **WARNING: should be avoided in most cases, use this method only if these conditions are fulfilled:**
   * - you don't need to manage the error callback (errors will silently fail),
   * - you don't need to wait the operation to finish before the next one (remember, it's asynchronous).
   */
  clearSubscribe(): void {

    this.clear().subscribe(() => {}, () => {});

  }

  /**
   * RxJS operator to catch if `indexedDB` is broken
   * @param operationCallback Callback with the operation to redo
   */
  private catchIDBBroken<T>(operationCallback: () => Observable<T>): OperatorFunction<T, any> {

    // TODO: check if it could be something other than Error
    return catchError((error: Error) => {

      // TODO: would be better to check error instanceof, search why the specific exception is lost
      /* Check if `indexedDB` is broken based on error message */
      if (error.message === IDB_BROKEN_ERROR) {

        /* Fallback to `localStorage` */
        this.database = new LocalStorageDatabase(this.prefix);

        /* Redo the operation */
        return operationCallback();

      } else {

        /* Otherwise, rethrow the error */
        return throwError(error);

      }

    });

  }

}
