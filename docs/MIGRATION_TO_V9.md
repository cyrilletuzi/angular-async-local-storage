# Migration guide to version 9

> [!WARNING]
> [Angular version 9 is officially outdated](https://angular.dev/reference/versions), so this version is not supported anymore.

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.dev/reference/versions):

> If you are updating from one major version to another, then we recommend that you do not skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 7.x.x to version 9.x.x, we recommend that you update to the latest 8.x.x release first. After successfully updating to 8.x.x, you can then update to 9.x.x.

**So if you update from version < 8, please do the [other migrations](../MIGRATION.md) first**.

## How to update

Then:

```
ng update @ngx-pwa/local-storage
```

**Please check the following point was done successfully**. Otherwise you would lost previously stored data.

## IMPORTANT: new `IDBNoWrap` default

Version 8 of the library fixed a legacy issue about how data was stored in `indexedDb`.

To manage backward compatibility, a new `IDBNoWrap` option was introduced:
- `true`: new and clean behavior
- `false`: old and backward-compatible behavior

In version 8, the default was `false`, to avoid breaking issues.

But now the library has schematics for automatic migrations, so we can move to the clean behavior, and thus `true` is now the default in version 9.

Doing `ng update` should have managed backward compatibility. But it is not easy to be sure schematics work in all cases, so be sure the migration was done correctly, **otherwise you would lost previously stored data**.

**Check the `AppModule` of each project where you use this lib**:
- if you started using this library in versions <= 7, you should see `StorageModale.forRoot({ IDBNoWrap: false })`,
- if you started using this library in version 8 and you followed instructions at that time (ie. you already set `IDBNoWrap` to `true` or used `ng add`), you should see `StorageModale.forRoot({ IDBNoWrap: true })` or no `IDBNoWrap` option at all.

**If `ng update` did not work as expected, please delay the update and file an issue.** Again, all previously stored data may be lost otherwise.

## Removed deprecated features

The following APIs were already deprecated in v8 and are now removed in v9. Please follow the [migration guide to v8](./MIGRATION_TO_V8.md) for more details about how to update to new APIs.

- Removed providers for prefix management
  - **If you are concerned, be very careful with this migration, otherwise you could lost previously stored data**
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

## More documentation

- [Full changelog for v9](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
