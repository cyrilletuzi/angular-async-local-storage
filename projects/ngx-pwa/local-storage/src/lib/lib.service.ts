import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { LocalDatabase } from './databases/local-database';
import { JSONSchema } from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';

export interface LSGetItemOptions {
  schema?: JSONSchema | null;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorage {

  /**
   * Number of items in the storage
   */
  get size(): Observable<number> {

    return this.database.size;

  }

  protected readonly getItemOptionsDefault: LSGetItemOptions = {
    schema: null
  };

  constructor(protected database: LocalDatabase, protected jsonValidator: JSONValidator) {}

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string, options: LSGetItemOptions & { schema: JSONSchema }): Observable<T | null>;
  getItem<T = any>(key: string, options?: LSGetItemOptions): Observable<unknown>;
  getItem<T = any>(key: string, options = this.getItemOptionsDefault) {

    return this.database.getItem<T>(key).pipe(

      /* Validate data upon a json schema if requested */
      mergeMap((data) => {

        if (data === null) {

          return of(null);

        } else if (options.schema) {

          let validation = true;

          try {
            validation = this.jsonValidator.validate(data, options.schema);
          } catch (error) {
            return throwError(error);
          }

          if (!validation) {
            return throwError(new Error(`JSON invalid`));
          }

        }

        return of(data as unknown);

      }));

  }

  /**
   * Gets an item value in local storage WITHOUT any validation.
   * It is a convenience method for development only: do NOT use it in production code,
   * as it can cause security issues and errors and may be removed in future versions.
   * Use the normal .getItem() method instead.
   * @ignore
   * @deprecated
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getUnsafeItem<T = any>(key: string): Observable<T | null> {

    return this.database.getItem<T>(key);

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
  setItem(key: string, data: any): Observable<boolean> {

    return this.database.setItem(key, data);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
  removeItem(key: string): Observable<boolean> {

    return this.database.removeItem(key);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
  clear(): Observable<boolean> {

    return this.database.clear();

  }

  /**
   * Get all keys stored in local storage
   * @returns A RxJS Observable returning an array of the indexes
   */
  keys(): Observable<string[]> {

    return this.database.keys();

  }

  /**
   * Tells if a key exists in storage
   * @returns A RxJS Observable telling if the key exists
   */
  has(key: string): Observable<boolean> {

    return this.database.has(key);

  }

  /**
   * Sets an item in local storage, and auto-subscribes
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   */
  setItemSubscribe(key: string, data: any): void {

    this.setItem(key, data).subscribe(() => {}, () => {});

  }

  /**
   * Deletes an item in local storage, and auto-subscribes
   * @param key The item's key
   */
   removeItemSubscribe(key: string): void {

    this.removeItem(key).subscribe(() => {}, () => {});

  }

  /** Deletes all items from local storage, and auto-subscribes */
  clearSubscribe(): void {

    this.clear().subscribe(() => {}, () => {});

  }

}
