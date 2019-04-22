/**
 * Exception message when a value is not valid against thr JSON schema
 */
export const VALIDATION_ERROR = `Data stored is not valid against the provided JSON schema.
Check your JSON schema, otherwise it means data has been corrupted.`;

/**
 * Exception raised when a value is not valid against thr JSON schema
 */
export class ValidationError extends Error {
  message = VALIDATION_ERROR;
}
