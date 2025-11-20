# Migration guide to version 21

## How to update

```bash
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 20, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

- Angular 21 is required.
- RxJS >= 7.6 is required.

> [!IMPORTANT]
> RxJS 6 is *not* supported.

Done, no code changes.

## More documentation

- [Full changelog for v21](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
