# Migration guide to version 15

## How to update

```
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 14, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

- Angular 15 is required.
- RxJS >= 7.4 is required.

> [!IMPORTANT]
> - RxJS 6 is *not* supported.

### Deprecation

Advanced configuration via `StorageModule.forRoot()` is deprecated.

Use the new `provideXXX()` methods as shown in the [interoperability](./INTEROPERABILITY.md) or [collision](./COLLISION.md) guides, depending on your case.

This aligns with the new standalone APIs in Angular 15.

## More documentation

- [Full changelog for v15](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
