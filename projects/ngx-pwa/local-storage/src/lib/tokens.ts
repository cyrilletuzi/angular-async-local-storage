import { InjectionToken } from '@angular/core';

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
 * Default version used for `indexedDB` database.
 */
export const DEFAULT_IDB_DB_VERSION = 1;

/**
 * Token to provide `indexedDB` database version.
 * Must be an unsigned **integer**.
 */
export const IDB_DB_VERSION = new InjectionToken<number>('localStorageIDBDBVersion', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_DB_VERSION
});

/**
 * Default name used for `indexedDB` object store.
 */
export const DEFAULT_IDB_STORE_NAME = 'localStorage';

/**
 * Token to provide `indexedDB` store name.
 * For backward compatibility, the default can't be set now, `IndexedDBDatabase` will do it at runtime.
 */
export const IDB_STORE_NAME = new InjectionToken<string>('localStorageIDBStoreName', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_STORE_NAME
});

/**
 * Default value for interoperability with native `indexedDB` and other storage libs,
 * by changing how values are stored in `indexedDB` database.
 * Currently defaults to `false` for backward compatiblity in existing applications.
 */
export const DEFAULT_IDB_NO_WRAP = false;

/**
 * Token to allow interoperability with native `indexedDB` and other storage libs,
 * by changing how values are stored in `indexedDB` database.
 * Currently defaults to `false` for backward compatiblity in existing applications
 * (**DO NOT CHANGE IT IN PRODUCTION**, as it would break with existing data),
 * but **should be `true` in all new applications, as it may become the default in a future version**.
 */
export const IDB_NO_WRAP = new InjectionToken<boolean>('localStorageIDBWrap', {
  providedIn: 'root',
  factory: () => DEFAULT_IDB_NO_WRAP
});

export interface StorageConfig {

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

  /**
   * Allows to change the database version used for `indexedDB` database.
   * Must be an unsigned **integer**.
   * **Use with caution as the creation of the store depends on the version.**
   * *Use only* for interoperability with other APIs or to avoid collision for multiple apps on the same subdomain.
   * **WARNING: do not change this option in an app already deployed in production, as previously stored data would be lost.**
   */
  IDBDBVersion?: number;

  /**
   * Allows interoperability with native `indexedDB` and other storage libs,
   * by changing how values are stored in `indexedDB` database.
   * Currently defaults to `false` for backward compatiblity in existing applications,
   * **DO NOT CHANGE IT IN PRODUCTION**, as it would break with existing data.
   * but **should be `true` in all new applications, as it may become the default in a future version**.
   */
  IDBNoWrap?: boolean;

}
