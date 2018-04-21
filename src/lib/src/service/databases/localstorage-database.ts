import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { of as observableOf } from 'rxjs/observable/of';
import { _throw as observableThrow } from 'rxjs/observable/throw';

import { LocalDatabase } from './local-database';

@Injectable()
export class LocalStorageDatabase extends LocalDatabase {

  protected prefix = '';

  /**
   * @param prefix Optional prefix to avoid collision in multiple apps on same subdomain
   */
  constructor(prefix = '') {

    super();

    if (prefix) {
      this.prefix = `${prefix}_`;
    }

  }

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string): Observable<T | null> {

    const unparsedData = localStorage.getItem(`${this.prefix}${key}`);
    let parsedData: T | null = null;

    if (unparsedData != null) {

      try {
        parsedData = JSON.parse(unparsedData);
      } catch (error) {
        return observableThrow(new Error(`Invalid data in localStorage.`));
      }

    }

    return observableOf(parsedData);

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
  setItem(key: string, data: any) {

    localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(data));

    return observableOf(true);

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
  removeItem(key: string) {

    localStorage.removeItem(`${this.prefix}${key}`);

    return observableOf(true);

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
  clear() {

    localStorage.clear();

    return observableOf(true);

  }

}
