import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { mergeMap, mapTo, toArray } from 'rxjs/operators';

import { StorageCommon } from './storage-common';
import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf, ValidationError
} from '../validation';

/**
 * @deprecated Will be removed in v9
 */
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
export class LocalStorage extends StorageCommon {

  /**
   * Number of items in storage
   * @deprecated Use `.length`, or use `.size` via the new `StorageMap` service. Will be removed in v9.
   */
  get size(): Observable<number> {

    return this.length;

  }

  /**
   * Number of items in storage
   */
  get length(): Observable<number> {

    return this.database.size;

  }

  /**
   * Get an item value in storage.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * Note you must pass the schema directly as the second argument.
   * Passing the schema in an object `{ schema }` is deprecated and only here for backward compatibility:
   * it may be removed in v9.
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
   * @param key The item's key
   * @returns The item's value if the key exists, `null` otherwise, wrapped in a RxJS `Observable`
   */
  getItem<T = string>(key: string, schema: JSONSchemaString): Observable<string | null>;
  getItem<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<number | null>;
  getItem<T = boolean>(key: string, schema: JSONSchemaBoolean): Observable<boolean | null>;
  getItem<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<string[] | null>;
  getItem<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<number[] | null>;
  getItem<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<boolean[] | null>;
  getItem<T = any>(key: string, schema: JSONSchema | { schema: JSONSchema }): Observable<T | null>;
  getItem<T = unknown>(key: string, schema?: null): Observable<unknown>;
  getItem<T = any>(key: string, schema: JSONSchema | { schema: JSONSchema } | null | undefined = null) {

    /* Get the data in storage */
    return this.database.get<T>(key).pipe(
      /* Check if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.get<T>(key)),
      mergeMap((data) => {

        if (data === undefined || data === null) {

          /* No need to validate if the data is `null` */
          return of(null);

        } else if (schema) {

          /* Backward compatibility with version <= 7 */
          const schemaFinal: JSONSchema = ('schema' in schema) ? schema.schema : schema;

          /* Validate data against a JSON schema if provied */
          if (!this.jsonValidator.validate(data, schemaFinal)) {
            return throwError(new ValidationError());
          }

          /* Data have been checked, so it's OK to cast */
          return of(data as T | null);

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
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  setItem(key: string, data: any): Observable<boolean> {

    return this.database.set(key, data).pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.set(key, data)),
      /* Backward compatibility with v7, this value will never be used */
      mapTo(true),
    );

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    return this.database.delete(key).pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.delete(key)),
      /* Backward compatibility with v7, this value will never be used */
      mapTo(true),
    );

  }

  /**
   * Delete all items in storage
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<boolean> {

    return this.database.clear().pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.clear()),
      /* Backward compatibility with v7, this value will never be used */
      mapTo(true),
    );

  }

  /**
   * Get all keys stored in storage
   * @returns A list of the keys wrapped in a RxJS `Observable`
   * @deprecated Moved to `StorageMap` service. Will be removed in v9.
   * Note that while this method was giving you all keys at once in an array,
   * the new `keys()` method in `StorageMap` service will *iterate* on each key.
   */
  keys(): Observable<string[]> {

    return this.database.keys().pipe(
      /* Catch if `indexedDb` is broken */
      this.catchIDBBroken(() => this.database.keys()),
      /* Backward compatibility with v7: transform interative `Observable` to a single array value */
      toArray(),
    );

  }

  /**
   * Tells if a key exists in storage
   * @returns A RxJS `Observable` telling if the key exists
   * @deprecated Moved to `StorageMap` service. Will be removed in v9.
   */
  has(key: string): Observable<boolean> {

    return this.database.has(key)
      /* Catch if `indexedDb` is broken */
      .pipe(this.catchIDBBroken(() => this.database.has(key)));

  }

}
