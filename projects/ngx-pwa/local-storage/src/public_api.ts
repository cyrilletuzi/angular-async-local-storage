/*
 * Public API Surface of local-storage
 */

export { JSONSchema } from './lib/validation/json-schema';
export { LocalDatabase } from './lib/databases/local-database';
export { IndexedDBDatabase } from './lib/databases/indexeddb-database';
export { LocalStorageDatabase } from './lib/databases/localstorage-database';
export { MockLocalDatabase } from './lib/databases/mock-local-database';
export { JSONValidator } from './lib/validation/json-validator';
export { LSGetItemOptions, LocalStorage } from './lib/lib.service';
export { localStorageProviders, LocalStorageProvidersConfig, LOCAL_STORAGE_PREFIX } from './lib/tokens';
