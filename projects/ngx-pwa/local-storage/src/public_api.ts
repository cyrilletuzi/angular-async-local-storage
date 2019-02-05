/*
 * Public API Surface of local-storage
 */

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber,
  JSONSchemaNumeric, JSONSchemaString, JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject
} from './lib/validation/json-schema';
export { LocalDatabase } from './lib/databases/local-database';
export { IndexedDBDatabase } from './lib/databases/indexeddb-database';
export { LocalStorageDatabase } from './lib/databases/localstorage-database';
export { MockLocalDatabase } from './lib/databases/mock-local-database';
export { JSONValidator } from './lib/validation/json-validator';
export { LSGetItemOptions, LocalStorage } from './lib/lib.service';
export {
  localStorageProviders, LocalStorageProvidersConfig, LOCAL_STORAGE_PREFIX, PREFIX,
  DEFAULT_INDEXEDDB_NAME, INDEXEDDB_NAME, DEFAULT_INDEXEDDB_STORE_NAME, INDEXEDDB_STORE_NAME
} from './lib/tokens';
