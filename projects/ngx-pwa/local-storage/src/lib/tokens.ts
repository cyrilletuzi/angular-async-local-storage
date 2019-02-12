import { InjectionToken, Provider } from '@angular/core';

/**
 * Default prefix.
 * *Use only to avoid conflict in multiple apps on the same subdomain.*
 */
export const DEFAULT_PREFIX = '';

/**
 * Token to provide a prefix to avoid collision when multiple apps on the same subdomain.
 */
export const PREFIX = new InjectionToken<string>('localStoragePrefix', {
  providedIn: 'root',
  factory: () => DEFAULT_PREFIX
});

/**
 * Default name used for `indexedDB` database.
 * *Use only for interoperability with other APIs.*
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
 * *Use only for interoperability with other APIs.*
 */
export const DEFAULT_IDB_STORE_NAME = 'storage';

/**
 * Default name used for `indexedDB` object store prior to v8.
 * **For backward compatibility only.**
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
