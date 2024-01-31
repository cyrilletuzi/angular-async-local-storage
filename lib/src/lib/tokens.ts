import { InjectionToken } from "@angular/core";

/**
 * Token to provide a prefix to `localStorage` keys.
 */
export const LS_PREFIX = new InjectionToken<string>("localStoragePrefix", {
  providedIn: "root",
  factory: () => ""
});

/**
 * Default name used for `indexedDB` database.
 */
export const DEFAULT_IDB_DB_NAME = "ngStorage";

/**
 * Token to provide `indexedDB` database name.
 */
export const IDB_DB_NAME = new InjectionToken<string>("localStorageIDBDBName", {
  providedIn: "root",
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
export const IDB_DB_VERSION = new InjectionToken<number>("localStorageIDBDBVersion", {
  providedIn: "root",
  factory: () => DEFAULT_IDB_DB_VERSION
});

/**
 * Default name used for `indexedDB` object store.
 */
export const DEFAULT_IDB_STORE_NAME = "localStorage";

/**
 * Token to provide `indexedDB` store name.
 * For backward compatibility, the default can't be set now, `IndexedDBDatabase` will do it at runtime.
 */
export const IDB_STORE_NAME = new InjectionToken<string>("localStorageIDBStoreName", {
  providedIn: "root",
  factory: () => DEFAULT_IDB_STORE_NAME
});

/**
 * Default value for interoperability with native `indexedDB` and other storage libs,
 * by changing how values are stored in `indexedDB` database.
 */
export const DEFAULT_IDB_NO_WRAP = true;

/**
 * Token to allow interoperability with native `indexedDB` and other storage libs,
 * by changing how values are stored in `indexedDB` database.
 * Defaults to `true`. Change to `false` for backward compatiblity in existing applications.
 * **DO NOT CHANGE THIS BEHAVIOR ONCE IN PRODUCTION**, as it would break with existing data.
 */
export const IDB_NO_WRAP = new InjectionToken<boolean>("localStorageIDBWrap", {
  providedIn: "root",
  factory: () => DEFAULT_IDB_NO_WRAP
});

export interface StorageConfig {

  /**
   * @deprecated Use `provideLocalStoragePrefix()` method instead
   */
  LSPrefix?: string;

  /**
   * @deprecated Use `provideIndexedDBDataBaseName()` method instead
   */
  IDBDBName?: string;

  /**
   * @deprecated Use `provideIndexedDBStoreName()` method instead
   */
  IDBStoreName?: string;

  /**
   * @deprecated Use `provideIndexedDBDataBaseVersion()` method instead
   */
  IDBDBVersion?: number;

  /**
   * Allows interoperability with native `indexedDB` and other storage libs,
   * by changing how values are stored in `indexedDB` database.
   * Defaults to `true`. Change to `false` for backward compatiblity in existing applications.
   * **DO NOT CHANGE THIS BEHAVIOR ONCE IN PRODUCTION**, as it would break with existing data.
   */
  IDBNoWrap?: boolean;

}
