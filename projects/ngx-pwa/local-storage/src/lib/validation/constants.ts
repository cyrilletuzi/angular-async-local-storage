import { JSONSchemaBoolean, JSONSchemaNumeric, JSONSchemaString } from './json-schema';

/* Schemas for primitive types */
export const SCHEMA_BOOLEAN: JSONSchemaBoolean = { type: 'boolean' };
export const SCHEMA_INTEGER: JSONSchemaNumeric = { type: 'integer' };
export const SCHEMA_NUMBER: JSONSchemaNumeric = { type: 'number' };
export const SCHEMA_STRING: JSONSchemaString = { type: 'string' };
