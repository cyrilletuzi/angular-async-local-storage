/*
 * Public API Surface of local-storage
 */

// TODO: Review public/private API before stable release
// TODO: Test with Bazel

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber,
  JSONSchemaNumeric, JSONSchemaString, JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject,
  VALIDATION_ERROR, ValidationError
} from './lib/validation';
export { LocalDatabase, SERIALIZATION_ERROR, SerializationError } from './lib/databases';
export { LocalStorage, StorageMap, LSGetItemOptions } from './lib/storages';
export {
  localStorageProviders, LocalStorageProvidersConfig,
  DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, LOCAL_STORAGE_PREFIX
} from './lib/tokens';
