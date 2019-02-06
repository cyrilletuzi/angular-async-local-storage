/*
 * Public API Surface of local-storage
 */

// TODO: Limit exports?

export {
  JSONSchema, JSONSchemaBoolean, JSONSchemaInteger, JSONSchemaNumber,
  JSONSchemaNumeric, JSONSchemaString, JSONSchemaArray, JSONSchemaArrayOf, JSONSchemaObject
} from './lib/validation/json-schema';
export { LocalDatabase } from './lib/databases/local-database';
export { LSGetItemOptions, LocalStorage } from './lib/lib.service';
export { localStorageProviders, LocalStorageProvidersConfig } from './lib/tokens';
export { VALIDATION_ERROR, ValidationError } from './lib/exceptions';
