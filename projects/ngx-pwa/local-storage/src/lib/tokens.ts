import { InjectionToken, Provider } from '@angular/core';

/**
 * Token to provide a prefix to avoid collision when multiple apps on the same subdomain.
 */
export const PREFIX = new InjectionToken<string>('localStoragePrefix', {
  providedIn: 'root',
  factory: () => ''
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
export const DEFAULT_IDB_STORE_NAME = 'localStorage';

/**
 * Token to provide `indexedDB` store name.
 */
export const IDB_STORE_NAME = new InjectionToken<string>('localStorageIDBStoreName', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_STORE_NAME
});

/**
 * Token to keep storing behavior prior to version 8.
 */
export const COMPATIBILITY_PRIOR_TO_V8 = new InjectionToken<boolean>('localStorageCompatibilityPriorToV8', {
  providedIn: 'root',
  factory: () => false
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

  /**
   * Flag to keep storing behavior prior to version 8.
   * Not needed for new installs,
   * **must be `true` for upgrades from versions prior to V8, otherwise previously stored data will be lost.**
   */
  compatibilityPriorToV8?: boolean;

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
    config.compatibilityPriorToV8 ? { provide: COMPATIBILITY_PRIOR_TO_V8, useValue: config.compatibilityPriorToV8 } : [],
  ];

}
