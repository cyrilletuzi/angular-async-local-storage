# Migration guide to version 18

## How to update

```bash
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 17, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

- Angular 18 is required.
- RxJS >= 7.6 is required.

> [!IMPORTANT]
> RxJS 6 is *not* supported.

- Made internal properties and methods of `StorageMap` natively private (`#property`) instead of protected. Extending `StorageMap` was undocumented so it is not considered a breaking change.

## More documentation

- [Full changelog for v18](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
