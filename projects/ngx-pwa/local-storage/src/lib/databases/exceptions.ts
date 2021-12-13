/**
 * Exception message when `indexedDB` is not working
 */
export const IDB_BROKEN_ERROR = 'indexedDB is not working';

/**
 * Exception raised when `indexedDB` is not working
 */
export class IDBBrokenError extends Error {
  override message = IDB_BROKEN_ERROR;
}

/**
 * Exception message when a value can't be serialized for `localStorage`
 */
export const SERIALIZATION_ERROR = `The storage is currently localStorage,
where data must be serialized, and the provided data can't be serialized.`;

/**
 * Exception raised when a value can't be serialized for `localStorage`
 */
export class SerializationError extends Error {
  override message = SERIALIZATION_ERROR;
}
