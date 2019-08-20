/*
 * Public API Surface of local-storage
 */

// TODO: Test with Bazel

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber, JSONSchemaString,
  JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject
} from './lib/validation';
export { LocalDatabase, SERIALIZATION_ERROR, SerializationError } from './lib/databases';
export { LocalStorage, StorageMap, ValidationError, VALIDATION_ERROR } from './lib/storages';
export { JSONValidator } from './lib/validation';
export { StorageConfig } from './lib/tokens';
export { StorageModule } from './lib/storage.module';
