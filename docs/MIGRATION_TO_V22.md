# Migration guide to version 22

## How to update

```bash
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 21, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

- Angular 22 is required.
- RxJS >= 7.6 is required.

> [!IMPORTANT]
> RxJS 6 is *not* supported.

- `StorageConfig` and `JSONSchema` properties have been marked as `readonly`. This is mainly to enforce immutability inside of the library to avoid bugs, it should not have impacts at usage.


## More documentation

- [Full changelog for v22](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
