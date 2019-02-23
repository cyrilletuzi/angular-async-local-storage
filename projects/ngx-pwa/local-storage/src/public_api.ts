/*
 * Public API Surface of local-storage
 */

// TODO: Review public/private API before stable release
// Investigate about RxJS v6.4 `.subscribe()` signatures deprecations in docs

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber,
  JSONSchemaNumeric, JSONSchemaString, JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject
} from './lib/validation/json-schema';
export { LocalDatabase } from './lib/databases/local-database';
export { LocalStorage, LSGetItemOptions } from './lib/lib.service';
export {
  localStorageProviders, LocalStorageProvidersConfig,
  DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, LOCAL_STORAGE_PREFIX
} from './lib/tokens';
export { VALIDATION_ERROR, ValidationError } from './lib/exceptions';
