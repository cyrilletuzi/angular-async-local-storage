import { Inject, Injectable } from '@angular/core';
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

  protected readonly getItemOptionsDefault = {
    schema: null
  };

  constructor(protected database: LocalDatabase, protected jsonValidator: JSONValidator) {}

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string, options: LSGetItemOptions = this.getItemOptionsDefault): Observable<T | null> {

    return this.database.getItem<T>(key).pipe(

      /* Validate data upon a json schema if requested */
      mergeMap((data) => {

        if (options.schema && data !== null) {

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

        return of(data);

      }));

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
