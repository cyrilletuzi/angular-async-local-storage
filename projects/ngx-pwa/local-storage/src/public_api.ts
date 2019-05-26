/*
 * Public API Surface of local-storage
 */

// TODO: Review public/private API before stable release
// TODO: Test with Bazel

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber,
  JSONSchemaNumeric, JSONSchemaString, JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject
} from './lib/validation';
export { LocalDatabase, SERIALIZATION_ERROR, SerializationError } from './lib/databases';
export { LocalStorage, StorageMap, LSGetItemOptions, ValidationError, VALIDATION_ERROR } from './lib/storages';
export { StorageConfig, localStorageProviders, LocalStorageProvidersConfig, LOCAL_STORAGE_PREFIX } from './lib/tokens';
export { StorageModule } from './lib/storage.module';
