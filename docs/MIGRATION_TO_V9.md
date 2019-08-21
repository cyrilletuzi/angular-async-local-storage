# Migration guide to version 9

## Removed deprecated features

The following APIs were already deprecated in v8 and are now removed in v9.
Please follow the [migration guide to v8](./MIGRATION_TO_V8.md) for more details about how to update to new APIs.

- Removed providers for prefix management
  - **If you're concerned, be very careful with this migration, otherwise you could lost previously stored data**
  - `{ provide: LOCAL_STORAGE_PREFIX, useValue: 'myapp' }` and `localStorageProviders()` (use `StorageModule.forRoot({ LSPrefix: 'myapp_', IDBDBName: 'myapp_ngStorage' })` module import instead)
  - `LocalStorageProvidersConfig` interface (useless)
- Removed APIs in validation
  - `JSONSchemaNumeric` interface (use `JSONSchema` instead)
  - `LSGetItemOptions` interface (useless)
- Removed methods in `LocalStorage` service
  - `.size` (use `.length` or `StorageMap.size` instead)
  - `.has()` (use `StorageMap.has()` instead)
  - `.keys()` (use *iterative* `StorageMap.keys()` instead)
  - `.setItemSubscribe()` (use `.setItem().subscribe()` instead)
  - `.removeItemSubscribe()` (use `.removeItem().subscribe()` instead)
  - `.clearSubscribe()` (use `.clear().subscribe()` instead)
