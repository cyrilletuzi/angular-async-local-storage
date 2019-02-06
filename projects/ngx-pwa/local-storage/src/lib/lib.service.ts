import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { LocalDatabase } from './databases/local-database';
import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf
} from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';

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
   */
  constructor(private database: LocalDatabase, private jsonValidator: JSONValidator) {}

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
      mergeMap((data) => {

        if (data === null) {

          /* No need to validate if the data is `null` */
          return of(null);

        } else if (options.schema) {

          /* Validate data against a JSON schema if provied */
          if (!this.jsonValidator.validate(data, options.schema)) {
            return throwError(new Error(`Data stored is not valid against the provided JSON schema. Check your JSON schema, otherwise it means data has been corrupted.`));
          }

        }

        // TODO: check it'll stay ok
        /* Cast to unknown (will be overrided if a schema was provided) */
        return of(data as unknown);

      }));

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

    return this.database.getItem<T>(key);

  }

  /**
   * Set an item in storage
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  setItem(key: string, data: string | number | boolean | object): Observable<boolean> {

    return this.database.setItem(key, data);

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    return this.database.removeItem(key);

  }

  /**
   * Delete all items in storage
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<boolean> {

    return this.database.clear();

  }

  /**
   * Get all keys stored in storage
   * @returns A list of the keys wrapped in a RxJS `Observable`
   */
  keys(): Observable<string[]> {

    return this.database.keys();

  }

  /**
   * Tells if a key exists in storage
   * @returns A RxJS `Observable` telling if the key exists
   */
  has(key: string): Observable<boolean> {

    return this.database.has(key);

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

}
