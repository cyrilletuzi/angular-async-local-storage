export { JSONSchema, JSONSchemaType } from './src/service/validation/json-schema';
export { LocalDatabase } from './src/service/databases/local-database';
export { IndexedDBDatabase } from './src/service/databases/indexeddb-database';
export { LocalStorageDatabase } from './src/service/databases/localstorage-database';
export { MockLocalDatabase } from './src/service/databases/mock-local-database';
export { JSONValidator } from './src/service/validation/json-validator';
export { LSGetItemOptions, LocalStorage } from './src/service/lib.service';
export { LocalStorageModule } from './src/module';
export { localStorageProviders, LocalStorageProvidersConfig, LOCAL_STORAGE_PREFIX } from './src/tokens';
/** @deprecated Use LocalStorage instead */
export { LocalStorage as AsyncLocalStorage } from './src/service/lib.service';
/** @deprecated Use LSGetItemOptions instead */
export { LSGetItemOptions as ALSGetItemOptions } from './src/service/lib.service';
/** @deprecated Use LocalDatabase instead */
export { LocalDatabase as AsyncLocalDatabase } from './src/service/databases/local-database';
/** @deprecated Use LocalStorageModule instead */
export { LocalStorageModule as AsyncLocalStorageModule } from './src/module';
