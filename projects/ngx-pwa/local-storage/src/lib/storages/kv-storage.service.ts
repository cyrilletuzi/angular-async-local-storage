import { Injectable } from '@angular/core';

import { StorageMap } from './storage-map.service';
import { JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber, JSONSchemaString, JSONSchemaArrayOf } from '../validation';

@Injectable({
  providedIn: 'root'
})
export class KVStorage {

  /* Use the `StorageMap` service to avoid code duplication */
  constructor(protected storageMap: StorageMap) {}

  /**
   * Get an item value in storage.
   * The signature has many overloads due to validation, **please refer to the documentation.**
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md}
   * @param key The item's key
   * @param schema Optional JSON schema to validate the data.
   * @returns A `Promise` with the value if the key exists, or `undefined` otherwise
   *
   * @example
   * this.kvStorage.get('key', { type: 'string' }).then((result) => {
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
   *   required: ['firstName']
   * };
   *
   * this.kvStorage.get<User>('user', schema).then((user) => {
   *   if (user) {
   *     user.firstName;
   *   }
   * });
   */
  get<T = string>(key: string, schema: JSONSchemaString): Promise<string | null>;
  get<T = number>(key: string, schema: JSONSchemaInteger | JSONSchemaNumber): Promise<number | null>;
  get<T = boolean>(key: string, schema: JSONSchemaBoolean): Promise<boolean | null>;
  get<T = string[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaString>): Promise<string[] | null>;
  get<T = number[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaInteger | JSONSchemaNumber>): Promise<number[] | null>;
  get<T = boolean[]>(key: string, schema: JSONSchemaArrayOf<JSONSchemaBoolean>): Promise<boolean[] | null>;
  get<T = any>(key: string, schema: JSONSchema): Promise<T | null>;
  get<T = unknown>(key: string, schema?: JSONSchema): Promise<unknown>;
  get<T = any>(key: string, schema?: JSONSchema | undefined) {

    return this.storageMap.get<T>(key, schema).toPromise();

  }

  /**
   * Set an item in storage.
   * Note that setting `null` or `undefined` will remove the item to avoid some browsers issues.
   * @param key The item's key
   * @param data The item's value
   * @param schema Optional JSON schema to validate the data
   * @returns A `Promise`, if you need to wait the end of the operation
   *
   * @example
   * this.kvStorage.set('key', 'value');
   */
  set(key: string, data: any, schema?: JSONSchema): Promise<undefined> {

    return this.storageMap.set(key, data, schema).toPromise();

  }

  /**
   * Delete an item in storage
   * @param key The item's key
   * @returns A `Promise`, if you need to wait the end of the operation
   *
   * @example
   * this.kvStorage.delete('key');
   */
  delete(key: string): Promise<undefined> {

    return this.storageMap.delete(key).toPromise();

  }

  /**
   * Delete all items in storage
   * @returns A `Promise`, if you need to wait the end of the operation
   *
   * @example
   * this.kvStorage.clear();
   */
  clear(): Promise<undefined> {

    return this.storageMap.clear().toPromise();

  }

}
