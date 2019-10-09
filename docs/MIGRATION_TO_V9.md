# Migration guide to version 9

```
ng update @ngx-pwa/local-storage --next
```

If you've already completed the full [v8 migration](./MIGRATION_TO_V8.md), you're done!
We asked you a lot in the previous major versions migrations, but now the lib is clean!

However, **please check the following point was done successfully**. Otherwise you would lost previously stored data.

## IMPORTANT: new `IDBNoWrap` default

Version 8 of the lib fixed a legacy issue about how data was stored in `indexedDb`.

To manage backward compatibility, a new `IDBNoWrap` option was introduced:
- `true`: new and clean behavior
- `false`: old and backward-compatible behavior

In version 8, the default was `false`, to avoid breaking issues.

But now the lib has schematics for automatic migrations, so we can move to the clean behavior,
and thus `true` is now the default in version 9.

Doing `ng update` should have managed backward compatibility. But it's not easy to be sure schematics work
in all cases, so be sure the migration was done correctly, **otherwise you would lost previously stored data**.

**Check the `AppModule` of each project where you use this lib**:
- if you started using this lib in versions <= 7, you should see `StorageModale.forRoot({ IDBNoWrap: false })`,
- if you started using this lib in version 8 and you followed instructions at that time
(ie. you already set `IDBNoWrap` to `true` or used `ng add`),
you should see `StorageModale.forRoot({ IDBNoWrap: true })` or no `IDBNoWrap` option at all.

If `ng update` didn't work as expected, please file an issue.

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
