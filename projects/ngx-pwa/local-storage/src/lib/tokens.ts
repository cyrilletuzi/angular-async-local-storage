import { InjectionToken, Provider } from '@angular/core';

/**
 * Internal. Use the `localStorageProviders()` helper function to provide options.
 */
export const PREFIX = new InjectionToken<string>('localStoragePrefix', {
  providedIn: 'root',
  factory: () => ''
});

/**
 * @deprecated Use the `localStorageProviders()` helper function to provide options.
 */
export const LOCAL_STORAGE_PREFIX = PREFIX;

/**
 * Default name used for `indexedDb` database.
 * *Use only for interoperability with other APIs.*
 */
export const DEFAULT_INDEXEDDB_NAME = 'ngStorage';

/**
 * Internal. Use the `localStorageProviders()` helper function to provide options.
 */
export const INDEXEDDB_NAME = new InjectionToken<string>('localStorageIndexedDbName', {
  providedIn: 'root',
  factory: () => DEFAULT_INDEXEDDB_NAME
});

/**
 * Default name used for `indexedDb` object store.
 * *Use only for interoperability with other APIs.*
 */
export const DEFAULT_INDEXEDDB_STORE_NAME = 'localStorage';

/**
 * Internal. Use the `localStorageProviders()` helper function to provide options.
 */
export const INDEXEDDB_STORE_NAME = new InjectionToken<string>('localStorageIndexedDbStoreName', {
  providedIn: 'root',
  factory: () => DEFAULT_INDEXEDDB_STORE_NAME
});

export interface LocalStorageProvidersConfig {

  /**
   * Optional prefix to avoid collision when there are *multiple apps on the same subdomain*
   * (makes no sense in other scenarios). **Avoid special characters.**
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  prefix?: string;

  /**
   * Allows to change the name used for `indexedDb` database. **Avoid special characters.**
   * *Use only for interoperability with other APIs or to avoid collision with other libs.*
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  indexedDbName?: string;

  /**
   * Allows to change the name used for `indexedDb` object store. **Avoid special characters.**
   * *Use only for interoperability with other APIs or to avoid collision with other libs.*
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  indexedDbStoreName?: string;

}

/**
 * Helper function to provide options. **Must be used at initialization, ie. in `AppModule`.**
 * @param config Options.
 * @returns A list of providers for the lib options.
 */
export function localStorageProviders(config: LocalStorageProvidersConfig): Provider[] {

  return [
    config.prefix ? { provide: PREFIX, useValue: config.prefix } : [],
    config.indexedDbName ? { provide: INDEXEDDB_NAME, useValue: config.indexedDbName } : [],
    config.indexedDbStoreName ? { provide: INDEXEDDB_STORE_NAME, useValue: config.indexedDbStoreName } : [],
  ];

}
