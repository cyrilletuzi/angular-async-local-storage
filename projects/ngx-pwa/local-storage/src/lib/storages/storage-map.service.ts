import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger,
  JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf
} from '../validation/json-schema';
import { SafeStorageMap } from './safe-storage-map.service';

@Injectable({
  providedIn: 'root'
})
export class StorageMap extends SafeStorageMap {

  // TODO: reorder overloads to try to put deprecated ones last
  /**
   * Get an item value in storage.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   * @param key The item's key
   * @param schema Optional JSON schema to validate the data. If you use a schema, check the new `SafeStorageMap` service.
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS `Observable`
   *
   * @example
   * this.storageMap.get('key', { type: 'string' }).subscribe((result) => {
   *   result; // string or undefined
   * });
   *
   * @example
   * const schema: JSONSchema = {
   *   type: 'object',
   *   properties: {
   *     firstName: { type: 'string' },
   *     lastName: { type: 'string' },
   *   },
   *   required: ['firstName']
   * };
   *
   * this.storageMap.get<User>('user', schema).subscribe((user) => {
   *   if (user) {
   *     user.firstName;
   *   }
   * });
   */
  get<T extends string = string>(key: string, schema: JSONSchemaString): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T = string>(key: string, schema: JSONSchemaString): Observable<string | undefined>;
  get<T extends number = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<number | undefined>;
  get<T extends boolean = boolean>(key: string, schema: JSONSchemaBoolean): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T = boolean>(key: string, schema: JSONSchemaBoolean): Observable<boolean | undefined>;
  get<T extends readonly string[] = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<string[] | undefined>;
  get<T extends readonly number[] = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<number[] | undefined>;
  get<T extends readonly boolean[] = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<boolean[] | undefined>;
  get<T = unknown>(key: string, schema: JSONSchema): Observable<T | undefined>;
  get(key: string): Observable<unknown>;
  /**
   * @deprecated The cast is useless here: as no JSON schema was provided for validation, the result will still be `unknown`.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  get<T>(key: string, schema?: JSONSchema): Observable<unknown>;
  get<T = unknown>(key: string, schema?: JSONSchema): Observable<unknown> {

    return (schema ?
      /* If schema was provided, data has been validated, so it is OK to cast */
      this.getAndValidate(key, schema) as Observable<T | undefined> :
      /* Otherwise we don't known what we got */
      this.getAndValidate(key) as Observable<unknown>
    );

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
   * this.storageMap.set('key', 'value').subscribe(() => {});
   */
  set(key: string, data: unknown, schema?: JSONSchema): Observable<undefined> {

    return this.setAndValidate(key, data, schema);

  }

  /**
   * Watch an item value in storage.
   * **Note only changes done via this lib will be watched**, external changes in storage can't be detected.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
   * @param key The item's key to watch
   * @param schema Optional but recommended JSON schema to validate the initial value
   * @returns An infinite `Observable` giving the current value
   */
  watch<T extends string = string>(key: string, schema: JSONSchemaString): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T = string>(key: string, schema: JSONSchemaString): Observable<string | undefined>;
  watch<T extends number = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Observable<number | undefined>;
  watch<T extends boolean = boolean>(key: string, schema: JSONSchemaBoolean): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T = boolean>(key: string, schema: JSONSchemaBoolean): Observable<boolean | undefined>;
  watch<T extends readonly string[] = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Observable<string[] | undefined>;
  watch<T extends readonly number[] = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Observable<number[] | undefined>;
  watch<T extends readonly boolean[] = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<T | undefined>;
  /**
   * @deprecated The cast is useless here and doesn't match the JSON schema. Just remove the cast.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Observable<boolean[] | undefined>;
  watch<T = unknown>(key: string, schema: JSONSchema): Observable<T | undefined>;
  watch(key: string): Observable<unknown>;
  /**
   * @deprecated The cast is useless here: as no JSON schema was provided for validation, the result will still be `unknown`.
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   */
  watch<T>(key: string, schema?: JSONSchema): Observable<unknown>;
  watch<T = unknown>(key: string, schema?: JSONSchema): Observable<unknown> {

    return (schema ?
      /* If schema was provided, data has been validated, so it is OK to cast */
      this.watchAndInit(key, schema) as Observable<T | undefined> :
      /* Otherwise we don't known what we got */
      this.watchAndInit(key) as Observable<unknown>
    );

  }

}
