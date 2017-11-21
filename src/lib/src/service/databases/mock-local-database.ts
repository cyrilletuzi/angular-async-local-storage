import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { of as observableOf } from 'rxjs/observable/of';

import { AsyncLocalDatabase } from './async-local-database';
import { ALSGetItemOptions } from '../lib.service';
import { JSONValidator } from '../validation/json-validator';

@Injectable()
export class MockLocalDatabase extends AsyncLocalDatabase {

  protected localStorage = new Map<string, any>();

  constructor(protected jsonValidator: JSONValidator) {

    super();

  }

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
   getItem<T = any>(key: string, options: ALSGetItemOptions = this.getItemOptionsDefault) {

    const rawData: T | null = this.localStorage.get(key);

    const observableData = observableOf((rawData !== undefined) ? rawData : null).pipe(
      /* Validate data upon a json schema if requested */
      map((data) => !options.schema || this.jsonValidator.validate(data, options.schema) ? data : null)
    );

    return observableData;

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
   setItem(key: string, data: any) {

    this.localStorage.set(key, data);

    return observableOf(true);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
   removeItem(key: string) {

    this.localStorage.delete(key);

    return observableOf(true);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
   clear() {

    this.localStorage.clear();

    return observableOf(true);

  }

}
