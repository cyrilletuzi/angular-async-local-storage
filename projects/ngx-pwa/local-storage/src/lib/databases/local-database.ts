import { Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

import { IDB_STORE_NAME, IDB_DB_NAME, LS_PREFIX, IDB_DB_VERSION, IDB_NO_WRAP } from '../tokens';
import { IndexedDBDatabase } from './indexeddb-database';
import { LocalStorageDatabase } from './localstorage-database';
import { MemoryDatabase } from './memory-database';

/**
 * Factory to create a storage according to browser support
 * @param platformId Context about the platform (`browser`, `server`...)
 * @param LSPrefix Prefix for `localStorage` keys to avoid collision for multiple apps on the same subdomain
 * @param IDBDBName `indexedDB` database name
 * @param IDBstoreName `indexedDB` storeName name
 * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/BROWSERS_SUPPORT.md}
 */
export function localDatabaseFactory(
  platformId: string, LSPrefix: string, IDBDBName: string, IDBStoreName: string,
  IDBDBVersion: number, IDBNoWrap: boolean): LocalDatabase {

  /* When storage is fully disabled in browser (via the "Block all cookies" option),
   * just trying to check `indexedDB` or `localStorage` variables causes a security exception.
   * Prevents https://github.com/cyrilletuzi/angular-async-local-storage/issues/118
   */
  try {

    // Do not explicit `window` here, as the global object is not the same in web workers
    if (isPlatformBrowser(platformId) && (indexedDB !== undefined) && (indexedDB !== null) && ('open' in indexedDB)) {

      /* Check:
      * - if we are in a browser context (issue: server-side rendering)
      * - it could exist but be `undefined` or `null` (issue: IE private mode)
      * - it could exists but not having a working API
      * Will be the case for:
      * - All other browsers in normal mode
      * - Chromium / Safari private mode, but in this case, data will be swiped when the user leaves the app */
      return new IndexedDBDatabase(IDBDBName, IDBStoreName, IDBDBVersion, IDBNoWrap);

    } else if (isPlatformBrowser(platformId)
    && (localStorage !== undefined) && (localStorage !== null) && ('getItem' in localStorage)) {

      /* Check:
      * - if we are in a browser context (issue: server-side rendering)
      * - if `localStorage` exists (to be sure)
      * - it could exists but not having a working API
      * Will be the case for:
      * - Safari cross-origin iframes, detected later in `IndexedDBDatabase.connect()`
      * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/42}
      * - IE / Firefox private mode, but in this case, data will be swiped when the user leaves the app
      * For Firefox, can only be detected later in `IndexedDBDatabase.connect()`
      * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=781982}
      */
      return new LocalStorageDatabase(LSPrefix);

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
  ]
})
export abstract class LocalDatabase {

  abstract readonly size: Observable<number>;

  abstract get(key: string): Observable<unknown | undefined>;
  abstract set(key: string, data: unknown): Observable<undefined>;
  abstract delete(key: string): Observable<undefined>;
  abstract clear(): Observable<undefined>;
  abstract keys(): Observable<string>;
  abstract has(key: string): Observable<boolean>;

}
