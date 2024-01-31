# Migration guide to version 6

> [!WARNING]
> [Angular version 6 is officially outdated](https://angular.dev/reference/versions), so this version is not supported anymore.

## Requirements

If you come from the old `angular-async-local-storage` package, you will need to **[migrate to the new `@ngx-pwa/local-storage` package](./MIGRATION_TO_NEW_PACKAGE.md)** first before upgrading to v6.

## Shorter classes names

For shorter code and more consistency, the `Async` prefix has been dropped everywhere.

You can easily and quickly migrate by doing **a global search/replace of**:
- **`AsyncLocalStorage` => `LocalStorage`**
- `AsyncLocalDatabase` => `LocalDatabase`
- `ALSGetItemOptions` => `LSGetItemOptions`

In most cases, you are probably only using the first one.

## No more `NgModule`

`LocalStorageModule` is no longer needed and so it is removed. Services are provided directly when injected in Angular >=6.

Just **delete the `LocalStorageModule` import in your `AppModule`**.

Done.

## More documentation

- [Full changelog for v6](../CHANGELOG.md#600-2018-07-26)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
