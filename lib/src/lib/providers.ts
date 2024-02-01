import { makeEnvironmentProviders, type EnvironmentProviders } from "@angular/core";
import { IDB_DB_NAME, IDB_DB_VERSION, IDB_STORE_NAME, LS_PREFIX } from "./tokens";

/**
 * Allows to add a prefix before `localStorage` keys.
 * 
 * *Use only* for interoperability with other APIs or to avoid collision for multiple applications on the same subdomain.
 * 
 * **WARNING: do not change this option in an application already deployed in production, as previously stored data would be lost.**
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideLocalStoragePrefix('custom_')]
 * };
 */
export function provideLocalStoragePrefix(prefix: string): EnvironmentProviders {

  return makeEnvironmentProviders([{ provide: LS_PREFIX, useValue: prefix }]);

}

/**
 * Allows to change the name used for `indexedDB` database.
 * 
 * *Use only* for interoperability with other APIs or to avoid collision for multiple applications on the same subdomain.
 * 
 * **WARNING: do not change this option in an application already deployed in production, as previously stored data would be lost.**
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideIndexedDBDataBaseName('custom')]
 * };
 */
export function provideIndexedDBDataBaseName(name: string): EnvironmentProviders {

  return makeEnvironmentProviders([{ provide: IDB_DB_NAME, useValue: name }]);

}

/**
 * Allows to change the database version used for `indexedDB` database.
 * Must be an unsigned **integer**.
 * 
 * **Use with caution as the creation of the store depends on the version.**
 * 
 * *Use only* for interoperability with other APIs or to avoid collision for multiple applications on the same subdomain.
 * 
 * **WARNING: do not change this option in an applicattion already deployed in production, as previously stored data would be lost.**
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideIndexedDBDataBaseVersion(2)]
 * };
 */
export function provideIndexedDBDataBaseVersion(version: number): EnvironmentProviders {

  return makeEnvironmentProviders([{ provide: IDB_DB_VERSION, useValue: version }]);

}

/**
 * Allows to change the name used for `indexedDB` object store.
 * 
 * *Use only* for interoperability with other APIs.
 * 
 * **WARNING: do not change this option in an application already deployed in production, as previously stored data would be lost.**
 *
 * @example
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideIndexedDBStoreName('custom')]
 * };
 */
export function provideIndexedDBStoreName(name: string): EnvironmentProviders {

  return makeEnvironmentProviders([{ provide: IDB_STORE_NAME, useValue: name }]);

}
