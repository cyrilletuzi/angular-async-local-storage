import { Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformWorkerApp, isPlatformWorkerUi } from '@angular/common';
import { Observable } from 'rxjs';

import { IndexedDBDatabase } from './indexeddb-database';
import { LocalStorageDatabase } from './localstorage-database';
import { MemoryDatabase } from './memory-database';
import { PREFIX } from '../tokens';

/**
 * Factory to create a storage according to browser support
 * @param platformId Context about the platform (`browser`, `server`...)
 * @param prefix Optional user prefix to avoid collision for multiple apps on the same subdomain
 * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/BROWSERS_SUPPORT.md
 */
export function localDatabaseFactory(platformId: Object, prefix: string): LocalDatabase {

  // Do not explicit `window` here, as the global object is not the same in web workers
  if ((isPlatformBrowser(platformId) || isPlatformWorkerApp(platformId) || isPlatformWorkerUi(platformId))
  && (indexedDB !== undefined) && (indexedDB !== null) && ('open' in indexedDB)) {

    /* Check:
     * - if we are in a browser context (issue: server-side rendering)
     * - if `indexedDB` exists (issue: IE9)
     * - it could exist but be `undefined` or `null` (issue: IE / Edge private mode)
     * - it could exists but not having a working API
     * Will be the case for:
     * - IE10+ and all other browsers in normal mode
     * - Chromium / Safari private mode, but in this case, data will be swiped when the user leaves the app */
    return new IndexedDBDatabase(prefix);

  } else if (isPlatformBrowser(platformId)
  && (localStorage !== undefined) && (localStorage !== null) && ('getItem' in localStorage)) {

    /* Check:
     * - if we are in a browser context (issue: server-side rendering)
     * - if `localStorage` exists (to be sure)
     * - it could exists but not having a working API
     * Will be the case for:
     * - IE9
     * - Safari cross-origin iframes, detected later in `IndexedDBDatabase.connect()`
     * @see https://github.com/cyrilletuzi/angular-async-local-storage/issues/42
     * - IE / Edge / Firefox private mode, but in this case, data will be swiped when the user leaves the app
     * For Firefox, can only be detected later in `IndexedDBDatabase.connect()`
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=781982
     */
    return new LocalStorageDatabase(prefix);

  } else {

    /* Will be the case for:
     * - Server-side rendering
     * - All other non-browser context
     */
    return new MemoryDatabase();

  }

}

@Injectable({
  providedIn: 'root',
  useFactory: localDatabaseFactory,
  deps: [
    PLATFORM_ID,
    PREFIX
  ]
})
export abstract class LocalDatabase {

  abstract readonly size: Observable<number>;

  abstract getItem<T = any>(key: string): Observable<T | null>;
  abstract setItem(key: string, data: any): Observable<boolean>;
  abstract removeItem(key: string): Observable<boolean>;
  abstract clear(): Observable<boolean>;
  abstract keys(): Observable<string[]>;
  abstract has(key: string): Observable<boolean>;

}
