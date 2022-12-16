# Migration guide to version 15

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.io/guide/releases):

> If you are updating from one major version to another, then we recommend that you don't skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 13.x.x to version 15.x.x, we recommend that you update to the latest 14.x.x release first. After successfully updating to 14.x.x, you can then update to 15.x.x.

**So if you update from version < 9, please do the [other migrations](../MIGRATION.md) first**.
The version 9 migration is especially important, as a wrongly done migration could lead to
the loss of all previously stored data.

## How to update

```
ng update @ngx-pwa/local-storage
```

## Breaking changes

- Angular 15 is required.
- RxJS >= 7.4 is required. RxJS 6 is not supported.

### Deprecation

Advanced configuration via `StorageModule.forRoot()` is deprecated.

Use the new `provideXXX()` methods as shown in the [interoperability](./INTEROPERABILITY.md) or [collision](./COLLISION.md) guides, depending on your case.

This aligns with the new standalone APIs in Angular 15.

## More documentation

- [Full changelog for v15](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
