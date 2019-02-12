import { InjectionToken, Provider } from '@angular/core';

/**
 * Token to provide a prefix to avoid collision when multiple apps on the same subdomain.
 * @deprecated Use options of `localStorageProviders()` instead. Will be removed in v9.
 */
export const LOCAL_STORAGE_PREFIX = new InjectionToken<string>('localStoragePrefix', {
  providedIn: 'root',
  factory: () => ''
});

/**
 * Token to provide a prefix to `localStorage` keys.
 */
export const LS_PREFIX = new InjectionToken<string>('localStoragePrefix', {
  providedIn: 'root',
  factory: () => ''
});

/**
 * Default name used for `indexedDB` database.
 */
export const DEFAULT_IDB_DB_NAME = 'ngStorage';

/**
 * Token to provide `indexedDB` database name.
 */
export const IDB_DB_NAME = new InjectionToken<string>('localStorageIDBDBName', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_DB_NAME
});

/**
 * Default name used for `indexedDB` object store.
 */
export const DEFAULT_IDB_STORE_NAME = 'storage';

/**
 * Default name used for `indexedDB` object store prior to v8.
 * @deprecated **For backward compatibility only.** May be removed in future versions.
 */
export const DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8 = 'localStorage';

/**
 * Token to provide `indexedDB` store name.
 * For backward compatibility, the default can't be set now, `IndexedDBDatabase` will do it at runtime.
 */
export const IDB_STORE_NAME = new InjectionToken<string | null>('localStorageIDBStoreName', {
  providedIn: 'root',
  factory: () => null
});

export interface LocalStorageProvidersConfig {

  /**
   * Prefix to avoid collision when there are *multiple apps on the same subdomain*.
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   * @deprecated Use `LSPrefix` and `IDBDBName` options instead. Will be removed in v9.
   */
  prefix?: string;

  /**
   * Allows to add a prefix before `localStorage` keys.
   * *Use only* for interoperability with other APIs or to avoid collision for multiple apps on the same subdomain.
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  LSPrefix?: string;

  /**
   * Allows to change the name used for `indexedDB` database.
   * *Use only* for interoperability with other APIs or to avoid collision for multiple apps on the same subdomain.
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  IDBDBName?: string;

  /**
   * Allows to change the name used for `indexedDB` object store.
   * *Use only* for interoperability with other APIs.
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  IDBStoreName?: string;

}

/**
 * Helper function to provide options. **Must be used at initialization, ie. in `AppModule`.**
 * @param config Options.
 * @returns A list of providers for the lib options.
 */
export function localStorageProviders(config: LocalStorageProvidersConfig): Provider[] {

  return [
    // tslint:disable-next-line: deprecation
    config.prefix ? { provide: LOCAL_STORAGE_PREFIX, useValue: config.prefix } : [],
    config.LSPrefix ? { provide: LS_PREFIX, useValue: config.LSPrefix } : [],
    config.IDBDBName ? { provide: IDB_DB_NAME, useValue: config.IDBDBName } : [],
    config.IDBStoreName ? { provide: IDB_STORE_NAME, useValue: config.IDBStoreName } : [],
  ];

}
