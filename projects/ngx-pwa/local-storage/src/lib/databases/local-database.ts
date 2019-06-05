import { Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

import { IndexedDBDatabase } from './indexeddb-database';
import { LocalStorageDatabase } from './localstorage-database';
import { MemoryDatabase } from './memory-database';
import { IDB_STORE_NAME, IDB_DB_NAME, LOCAL_STORAGE_PREFIX, LS_PREFIX, IDB_DB_VERSION, IDB_NO_WRAP } from '../tokens';

/**
 * Factory to create a storage according to browser support
 * @param platformId Context about the platform (`browser`, `server`...)
 * @param LSPrefix Prefix for `localStorage` keys to avoid collision for multiple apps on the same subdomain
 * @param IDBDBName `indexedDB` database name
 * @param IDBstoreName `indexedDB` storeName name
 * @param oldPrefix Prefix option prior to v8 to avoid collision for multiple apps on the same subdomain
 * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/BROWSERS_SUPPORT.md}
 */
export function localDatabaseFactory(
  platformId: string, LSPrefix: string, IDBDBName: string, IDBStoreName: string,
  IDBDBVersion: number, IDBNoWrap: boolean, oldPrefix: string): LocalDatabase {

  /* When storage is fully disabled in browser (via the "Block all cookies" option),
   * just trying to check `indexedDB` or `localStorage` variables causes a security exception.
   * Prevents https://github.com/cyrilletuzi/angular-async-local-storage/issues/118
   */
  try {

    // Do not explicit `window` here, as the global object is not the same in web workers
    if (isPlatformBrowser(platformId) && (indexedDB !== undefined) && (indexedDB !== null) && ('open' in indexedDB)) {

      /* Check:
      * - if we are in a browser context (issue: server-side rendering)
      * - if `indexedDB` exists (issue: IE9)
      * - it could exist but be `undefined` or `null` (issue: IE / Edge private mode)
      * - it could exists but not having a working API
      * Will be the case for:
      * - IE10+ and all other browsers in normal mode
      * - Chromium / Safari private mode, but in this case, data will be swiped when the user leaves the app */
      return new IndexedDBDatabase(IDBDBName, IDBStoreName, IDBDBVersion, IDBNoWrap, oldPrefix);

    } else if (isPlatformBrowser(platformId)
    && (localStorage !== undefined) && (localStorage !== null) && ('getItem' in localStorage)) {

      /* Check:
      * - if we are in a browser context (issue: server-side rendering)
      * - if `localStorage` exists (to be sure)
      * - it could exists but not having a working API
      * Will be the case for:
      * - IE9
      * - Safari cross-origin iframes, detected later in `IndexedDBDatabase.connect()`
      * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/42}
      * - IE / Edge / Firefox private mode, but in this case, data will be swiped when the user leaves the app
      * For Firefox, can only be detected later in `IndexedDBDatabase.connect()`
      * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=781982}
      */
      return new LocalStorageDatabase(LSPrefix, oldPrefix);

    }

  } catch {}

  /* Will be the case for:
   * - In browsers if storage has been fully disabled (via the "Block all cookies" option)
   * - Server-side rendering
   * - All other non-browser context
   */
  return new MemoryDatabase();

}

@Injectable({
  providedIn: 'root',
  useFactory: localDatabaseFactory,
  deps: [
    PLATFORM_ID,
    LS_PREFIX,
    IDB_DB_NAME,
    IDB_STORE_NAME,
    IDB_DB_VERSION,
    IDB_NO_WRAP,
    // tslint:disable-next-line: deprecation
    LOCAL_STORAGE_PREFIX,
  ]
})
export abstract class LocalDatabase {

  abstract readonly size: Observable<number>;

  abstract get<T = any>(key: string): Observable<T | undefined>;
  abstract set(key: string, data: any): Observable<undefined>;
  abstract delete(key: string): Observable<undefined>;
  abstract clear(): Observable<undefined>;
  abstract keys(): Observable<string>;
  abstract has(key: string): Observable<boolean>;

}
