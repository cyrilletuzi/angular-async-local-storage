/*
 * Public API Surface of local-storage
 */

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber, JSONSchemaString,
  JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject, JSONSchemaUnknown
} from './lib/validation/json-schema';
export { JSONValidator } from './lib/validation/json-validator';

export { LocalDatabase } from './lib/databases/local-database';
export { SERIALIZATION_ERROR, SerializationError } from './lib/databases/exceptions';

export { SafeStorageMap, DatabaseEntries } from './lib/storages/safe-storage-map.service';
export { StorageMap } from './lib/storages/storage-map.service';
export { LocalStorage } from './lib/storages/local-storage.service';
export {
  ValidationError, VALIDATION_ERROR,
  DatabaseEntriesKeyError, DATABASE_ENTRIES_KEY_ERROR,
  DatabaseEntriesSchemaError, DATABASE_ENTRIES_SCHEMA_ERROR,
} from './lib/storages/exceptions';

export { StorageConfig } from './lib/tokens';
export { StorageModule } from './lib/storage.module';
