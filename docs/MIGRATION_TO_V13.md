# Migration guide to version 13

> [!WARNING]
> [Angular version 13 & 14 are officially outdated](https://angular.dev/reference/versions), so this version is not supported anymore.

## How to update

```bash
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 12, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

### Internet Explorer is dead

Angular 13 dropped IE 11 support, and so this library too.

## More documentation

- [Full changelog for v13](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
