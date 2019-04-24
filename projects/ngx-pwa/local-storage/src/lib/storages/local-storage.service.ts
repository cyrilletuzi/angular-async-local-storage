import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mapTo, toArray, map } from 'rxjs/operators';

import { StorageMap } from './storage-map.service';
import { JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf } from '../validation';

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
export class LocalStorage {

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

    return this.storageMap.size;

  }

  /* Use the `StorageMap` service to avoid code duplication */
  constructor(private storageMap: StorageMap) {}

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

    if (schema) {

      /* Backward compatibility with version <= 7 */
      const schemaFinal: JSONSchema = ('schema' in schema) ? schema.schema : schema;

      return this.storageMap.get<T>(key, schemaFinal).pipe(
        /* Transform `undefined` into `null` to align with `localStorage` API */
        map((value) => (value !== undefined) ? value : null),
      );

    } else {

      return this.storageMap.get(key).pipe(
        /* Transform `undefined` into `null` to align with `localStorage` API */
        map((value) => (value !== undefined) ? value : null),
      );

    }

  }

  /**
   * Set an item in storage
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  setItem(key: string, data: any): Observable<boolean> {

    return this.storageMap.set(key, data).pipe(
      /* Transform `undefined` into `true` for backward compatibility with v7 */
      mapTo(true),
    );

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    return this.storageMap.delete(key).pipe(
      /* Transform `undefined` into `true` for backward compatibility with v7 */
      mapTo(true),
    );

  }

  /**
   * Delete all items in storage
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<boolean> {

    return this.storageMap.clear().pipe(
      /* Transform `undefined` into `true` for backward compatibility with v7 */
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

    return this.storageMap.keys().pipe(
      /* Backward compatibility with v7: transform iterating `Observable` to a single array value */
      toArray(),
    );

  }

  /**
   * Tells if a key exists in storage
   * @returns A RxJS `Observable` telling if the key exists
   * @deprecated Moved to `StorageMap` service. Will be removed in v9.
   */
  has(key: string): Observable<boolean> {

    return this.storageMap.has(key);

  }

}
