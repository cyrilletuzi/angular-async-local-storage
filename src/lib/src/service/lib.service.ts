import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AsyncLocalDatabase } from './databases/index';
import { JSONSchema } from './validation/json-schema';

export interface ALSGetItemOptions {
  schema?: JSONSchema | null;
}

@Injectable()
export class AsyncLocalStorage {

  protected database: AsyncLocalDatabase;

  /**
   * Injects a local database
   */
  constructor(database: AsyncLocalDatabase) {

    this.database = database;

  }

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string, options?: ALSGetItemOptions) {

    return this.database.getItem<T>(key, options);

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
