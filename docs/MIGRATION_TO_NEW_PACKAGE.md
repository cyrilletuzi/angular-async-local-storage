# Migration guide to the new package

This lib has been renamed from `angular-async-local-storage` to **`@ngx-pwa/local-storage`**.

But **do not worry: the previous package is still here** and will be as long as npm exists. Migration to the new package is recommended as soon as possible to enjoy bug fixes and new features, but is not required for Angular 4 & 5. **It is only required when upgrading to Angular >= 6.**

## Versions

- v10 for Angular 10,
- v11 for Angular 11,
- v12 for Angular 12,
- v13 for Angular 13 & 14,
- v15 for Angular 15,
- v16 for Angular 16,
- v17 for Angular 17.

[Angular <= 13 are officially outdated](https://angular.io/guide/releases).

## Installing the new package

The migration is very easy. First, **install the new package**:

- for **Angular 4** (meaning you come from `angular-async-local-storage` version 2):
```bash
npm install @ngx-pwa/local-storage@4
```

- for **Angular 5** (meaning you come from `angular-async-local-storage` version 3):
```bash
npm install @ngx-pwa/local-storage@5
```

- for **Angular 6 & 7**:
```bash
npm install @ngx-pwa/local-storage@6
```

- for **Angular >= 8**: you must [update to v6 first](./MIGRATION_TO_V6.md), then do the [other migrations](../MIGRATION.md) in an incremental way, especially [the version 9 migration](./MIGRATION_TO_V9.md), as it can lead to the loss of all previsouly stored data if it is not done correctly.

## Refactoring

Then, **do a global search of `angular-async-local-storage` in your project, and replace with `@ngx-pwa/local-storage`**.

Finally, you can uninstall the previous package:
```bash
npm uninstall angular-async-local-storage
```

Done.

## Code changes

There is **no code change in v4 and v5**.

There are code changes if you are upgrading to Angular >=6, see [the other migration guides](../MIGRATION.md).

## More documentation

- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
