# Migration guide to version 12

> [!WARNING]
> [Angular version 12 is officially outdated](https://angular.dev/reference/versions), so this version is not supported anymore.

## How to update

```bash
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 11, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

### Typings

Incorrect typings that were deprecated in v11 for `.get()` and `.watch()` are now removed:
- `this.storage.get<User>('user')` (add a JSON schema or remove the cast)
- `this.storage.get('user', { type: 'object' })` (cast is required in addition to the JSON schema for non-primitive types)
- `this.storage.get<number>('name', { type: 'string' })` (and all other primitive mismatches)

See the [migration guide for v11](./MIGRATION_TO_V11.md) for detailed instructions.

### ViewEngine support removed

Angular 2-8 internal engine was named ViewEngine. It was replaced automatically by a new engine called Ivy in Angular 9.

While Angular 9-11 still allowed to manually switch back to ViewEngine, Angular 12 has removed ViewEngine support. So now libraries are compiled directly for Ivy.

## Other changes

### Internet Explorer 11 support deprecated

Angular 12 deprecates IE 11 support. Meaning it is still supported, but it will be removed in version 13.

## More documentation

- [Full changelog for v12](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
