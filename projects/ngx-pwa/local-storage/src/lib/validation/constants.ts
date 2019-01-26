import { JSONSchemaBoolean, JSONSchemaNumeric, JSONSchemaString, JSONSchemaArrayOf } from './json-schema';

/* Schemas for primitive types */
export const SCHEMA_BOOLEAN: JSONSchemaBoolean = { type: 'boolean' };
export const SCHEMA_INTEGER: JSONSchemaNumeric = { type: 'integer' };
export const SCHEMA_NUMBER: JSONSchemaNumeric = { type: 'number' };
export const SCHEMA_STRING: JSONSchemaString = { type: 'string' };

/* Schemas for basic arrays */
export const SCHEMA_ARRAY_OF_BOOLEANS: JSONSchemaArrayOf<JSONSchemaBoolean> = {
  type: 'array',
  items: SCHEMA_BOOLEAN
};
export const SCHEMA_ARRAY_OF_INTEGERS: JSONSchemaArrayOf<JSONSchemaNumeric> = {
  type: 'array',
  items: SCHEMA_INTEGER
};
export const SCHEMA_ARRAY_OF_NUMBERS: JSONSchemaArrayOf<JSONSchemaNumeric> = {
  type: 'array',
  items: SCHEMA_NUMBER
};
export const SCHEMA_ARRAY_OF_STRINGS: JSONSchemaArrayOf<JSONSchemaString> = {
  type: 'array',
  items: SCHEMA_STRING
};
