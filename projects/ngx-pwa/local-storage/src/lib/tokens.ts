import { InjectionToken, Provider } from '@angular/core';

// TODO: check if all characters are OK for options

/**
 * Internal. Use the `localStorageProviders()` helper function to provide options.
 */
export const PREFIX = new InjectionToken<string>('localStoragePrefix', {
  providedIn: 'root',
  factory: () => ''
});

/**
 * @deprecated Use the `localStorageProviders()` helper function to provide options. Will be removed in v9.
 */
export const LOCAL_STORAGE_PREFIX = PREFIX;

/**
 * Default name used for `indexedDB` database.
 * *Use only for interoperability with other APIs.*
 */
export const DEFAULT_IDB_DB_NAME = 'ngStorage';

/**
 * Internal. Use the `localStorageProviders()` helper function to provide options.
 */
export const IDB_DB_NAME = new InjectionToken<string>('localStorageIndexedDbName', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_DB_NAME
});

/**
 * Default name used for `indexedDB` object store.
 * *Use only for interoperability with other APIs.*
 */
export const DEFAULT_IDB_STORE_NAME = 'localStorage';

/**
 * Internal. Use the `localStorageProviders()` helper function to provide options.
 */
export const IDB_STORE_NAME = new InjectionToken<string>('localStorageIndexedDbStoreName', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_STORE_NAME
});

export interface LocalStorageProvidersConfig {

  /**
   * Optional prefix to avoid collision when there are *multiple apps on the same subdomain*
   * (makes no sense in other scenarios). **Avoid special characters.**
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  prefix?: string;

  /**
   * Allows to change the name used for `indexedDB` database. **Avoid special characters.**
   * *Use only for interoperability with other APIs or to avoid collision with other libs.*
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  IDBDBName?: string;

  /**
   * Allows to change the name used for `indexedDB` object store. **Avoid special characters.**
   * *Use only for interoperability with other APIs or to avoid collision with other libs.*
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
    config.prefix ? { provide: PREFIX, useValue: config.prefix } : [],
    config.IDBDBName ? { provide: IDB_DB_NAME, useValue: config.IDBDBName } : [],
    config.IDBStoreName ? { provide: IDB_STORE_NAME, useValue: config.IDBStoreName } : [],
  ];

}
