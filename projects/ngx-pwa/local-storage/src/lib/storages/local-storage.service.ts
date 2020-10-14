import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mapTo, map } from 'rxjs/operators';

import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf
} from '../validation/json-schema';
import { StorageMap } from './storage-map.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorage {

  /**
   * Number of items in storage wrapped in an `Observable`
   *
   * @example
   * this.localStorage.length.subscribe((length) => {
   *   console.log(length);
   * });
   */
  get length(): Observable<number> {

    return this.storageMap.size;

  }

  /* Use the `StorageMap` service to avoid code duplication */
  constructor(protected storageMap: StorageMap) {}

  /**
   * Get an item value in storage.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   * @param key The item's key
   * @param schema Optional JSON schema to validate the data.
   * **Note you must pass the schema directly as the second argument.**
   * **Passing the schema in an object `{ schema }` is deprecated and only here**
   * **for backward compatibility: it will be removed in a future version.**
   * @returns The item's value if the key exists, `null` otherwise, wrapped in a RxJS `Observable`
   *
   * @example
   * this.localStorage.get('key', { type: 'string' }).subscribe((result) => {
   *   result; // string or null
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
   * this.localStorage.get<User>('user', schema).subscribe((user) => {
   *   if (user) {
   *     user.firstName;
   *   }
   * });
   */
  getItem<T = string>(key: string, schema: JSONSchemaString): Observable<string | null>;
  getItem<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<number | null>;
  getItem<T = boolean>(key: string, schema: JSONSchemaBoolean): Observable<boolean | null>;
  getItem<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<string[] | null>;
  getItem<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<number[] | null>;
  getItem<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<boolean[] | null>;
  getItem<T = unknown>(key: string, schema: JSONSchema | { schema: JSONSchema }): Observable<T | null>;
  getItem<T = unknown>(key: string, schema?: JSONSchema): Observable<T>;
  getItem<T = unknown>(key: string, schema?: JSONSchema | { schema: JSONSchema } | undefined): Observable<T> {

    if (schema) {

      /* Backward compatibility with version <= 7 */
      const schemaFinal: JSONSchema = ('schema' in schema) ? schema.schema : schema;

      return this.storageMap.get<T>(key, schemaFinal).pipe(
        /* Transform `undefined` into `null` to align with `localStorage` API */
        // tslint:disable-next-line: no-non-null-assertion
        map((value) => (value !== undefined) ? value : null!),
      );

    } else {

      return this.storageMap.get(key).pipe(
        /* Transform `undefined` into `null` to align with `localStorage` API */
        // tslint:disable-next-line: no-non-null-assertion
        map((value) => (value !== undefined) ? value as T : null!),
      );

    }

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
   * this.localStorage.set('key', 'value').subscribe(() => {});
   */
  setItem(key: string, data: unknown, schema?: JSONSchema): Observable<boolean> {

    return this.storageMap.set(key, data, schema).pipe(
      /* Transform `undefined` into `true` for backward compatibility with v7 */
      mapTo(true),
    );

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   *
   * @example
   * this.localStorage.delete('key').subscribe(() => {});
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
   *
   * @example
   * this.localStorage.clear().subscribe(() => {});
   */
  clear(): Observable<boolean> {

    return this.storageMap.clear().pipe(
      /* Transform `undefined` into `true` for backward compatibility with v7 */
      mapTo(true),
    );

  }

}
