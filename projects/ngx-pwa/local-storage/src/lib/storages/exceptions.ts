/**
 * Exception message when a value is not valid against the JSON schema
 */
export const VALIDATION_ERROR = `Data stored is not valid against the provided JSON schema.
Check your JSON schema, otherwise it means data has been corrupted.`;

/**
 * Exception raised when a value is not valid against the JSON schema
 */
export class ValidationError extends Error {
  message = VALIDATION_ERROR;
}

/**
 * Exception message when a key does not exist in the database entries description
 */
export const DATABASE_ENTRIES_KEY_ERROR = `This key is not defined in the database entries description.`;

/**
 * Exception raised when a key does not exist in the database entries description
 */
export class DatabaseEntriesKeyError extends Error {
  message = DATABASE_ENTRIES_KEY_ERROR;
}

/**
 * Exception message when a key doestn't have an associated JSON schema in the database entries description
 */
export const DATABASE_ENTRIES_SCHEMA_ERROR = `This key has no associated JSON schema in the database entries description.`;

/**
 * Exception raised when a key doestn't have an associated JSON schema in the database entries description
 */
export class DatabaseEntriesSchemaError extends Error {
  message = DATABASE_ENTRIES_SCHEMA_ERROR;
}
