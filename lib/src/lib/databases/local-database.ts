import { isPlatformBrowser } from "@angular/common";
import { assertInInjectionContext, inject, PLATFORM_ID, Service } from "@angular/core";
import { Observable } from "rxjs";
import { IndexedDBDatabase } from "./indexeddb-database";
import { LocalStorageDatabase } from "./localstorage-database";
import { MemoryDatabase } from "./memory-database";

/**
 * Factory to create a storage according to browser support
 * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/BROWSERS_SUPPORT.md}
 */
export function localDatabaseFactory(): LocalDatabase {

  assertInInjectionContext(localDatabaseFactory);

  const platformId = inject(PLATFORM_ID);

  const isBrowser = isPlatformBrowser(platformId);
  let isIndexedDBAvailable = false;
  let isLocalStorageAvailable = false;

  /* When storage is fully disabled in browser (via the "Block all cookies" option),
   * just trying to check `indexedDB` or `localStorage` variables causes a security exception.
   * Prevents https://github.com/cyrilletuzi/angular-async-local-storage/issues/118
   * Only the checks are guarded, so other errors are not hidden.
   */
  try {

    /* Check:
     * - if we are in a browser context (issue: server-side rendering)
     * - it could exist but be `undefined` or `null`
     * - it could exists but not having a working API
     * Do not explicit `window` here, as the global object is not the same in web workers
     */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- They can be undefined in some browsers scenarios
    isIndexedDBAvailable = isBrowser && (indexedDB !== undefined) && (indexedDB !== null) && ("open" in indexedDB);

    /* Same checks for `localStorage`, only needed if `indexedDB` is not available */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- They can be undefined in some browsers scenarios
    isLocalStorageAvailable = !isIndexedDBAvailable && isBrowser && (localStorage !== undefined) && (localStorage !== null) && ("getItem" in localStorage);

  } catch {}

  if (isIndexedDBAvailable) {

    /* Will be the case for:
     * - All other browsers in normal mode
     * - Chromium / Safari / Firefox private mode, but in this case, data will be swiped when the user leaves the app
     * - Safari cross-origin iframes, but it will be detected later in `IndexedDBDatabase.connect()` and fallback to `localStorage`
     * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/issues/42}
     */
    return new IndexedDBDatabase();

  }

  if (isLocalStorageAvailable) {

    return new LocalStorageDatabase();

  }

  /* Will be the case for:
   * - In browsers if storage has been fully disabled (via the "Block all cookies" option)
   * - Server-side rendering
   * - All other non-browser context
   */
  return new MemoryDatabase();

}

@Service({
  factory: localDatabaseFactory,
})
export abstract class LocalDatabase {

  abstract readonly size: Observable<number>;

  abstract get(key: string): Observable<unknown>;
  abstract set(key: string, data: unknown): Observable<undefined>;
  abstract delete(key: string): Observable<undefined>;
  abstract clear(): Observable<undefined>;
  abstract keys(): Observable<string>;
  abstract has(key: string): Observable<boolean>;

}
