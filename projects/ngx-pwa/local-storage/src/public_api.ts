/*
 * Public API Surface of local-storage
 */

// TODO: Limit exports?

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber,
  JSONSchemaNumeric, JSONSchemaString, JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject
} from './lib/validation/json-schema';
export { LocalDatabase } from './lib/databases/local-database';
export { IndexedDBDatabase } from './lib/databases/indexeddb-database';
export { LocalStorageDatabase } from './lib/databases/localstorage-database';
export { MemoryDatabase } from './lib/databases/memory-database';
export { JSONValidator } from './lib/validation/json-validator';
export { LSGetItemOptions, LocalStorage } from './lib/lib.service';
export {
  localStorageProviders, LocalStorageProvidersConfig, LOCAL_STORAGE_PREFIX, PREFIX,
  DEFAULT_IDB_DB_NAME, IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, IDB_STORE_NAME
} from './lib/tokens';
