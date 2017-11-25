import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';
import { _throw as observableThrow } from 'rxjs/observable/throw';
import { of as observableOf } from 'rxjs/observable/of';

import { AsyncLocalDatabase } from './databases/async-local-database';
import { JSONSchema } from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';

export interface ALSGetItemOptions {
  schema?: JSONSchema | null;
}

@Injectable()
export class AsyncLocalStorage {

  protected readonly getItemOptionsDefault = {
    schema: null
  };

  constructor(protected database: AsyncLocalDatabase, protected jsonValidator: JSONValidator) {}

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string, options: ALSGetItemOptions = this.getItemOptionsDefault) {

    return this.database.getItem<T>(key).pipe(

      /* Validate data upon a json schema if requested */
      mergeMap((data) => {

        if (options.schema && data !== null) {

          let validation = true;

          try {
            validation = this.jsonValidator.validate(data, options.schema);
          } catch (error) {
            return observableThrow(error);
          }

          if (!validation) {
            return observableThrow(new Error(`JSON invalid`));
          }

        }

        return observableOf(data);

      }));

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
   setItem(key: string, data: any) {

    return this.database.setItem(key, data);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
   removeItem(key: string) {

    return this.database.removeItem(key);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
   clear() {

    return this.database.clear();

  }

}
