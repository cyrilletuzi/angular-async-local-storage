/*
 * Public API Surface of local-storage
 */

export { SERIALIZATION_ERROR, SerializationError } from "./lib/databases/exceptions";
export {
  provideIndexedDBDataBaseName, provideIndexedDBDataBaseVersion,
  provideIndexedDBStoreName, provideLocalStoragePrefix
} from "./lib/providers";
export { StorageModule } from "./lib/storage.module";
export { VALIDATION_ERROR, ValidationError } from "./lib/storages/exceptions";
export { StorageMap } from "./lib/storages/storage-map";
export type { StorageConfig } from "./lib/tokens";
export type { JSONSchema } from "./lib/validation/json-schema";

