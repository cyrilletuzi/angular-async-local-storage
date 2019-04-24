/**
 * Exception message when `indexedDB` is not working
 */
export const IDB_BROKEN_ERROR = 'indexedDB is not working';

/**
 * Exception raised when `indexedDB` is not working
 */
export class IDBBrokenError extends Error {
  message = IDB_BROKEN_ERROR;
}
