# Migration guide to version 12

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.io/guide/releases):

> If you are updating from one major version to another, then we recommend that you don't skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 10.x.x to version 12.x.x, we recommend that you update to the latest 11.x.x release first. After successfully updating to 11.x.x, you can then update to 12.x.x.

**So if you update from version < 9, please do the [other migrations](../MIGRATION.md) first**.
The version 9 migration is especially important, as a wrongly done migration could lead to
the loss of all previously stored data.

## How to update

Then:

```
ng update @ngx-pwa/local-storage
```

Done!

## Breaking changes

### Typings

Incorrect typings that were deprecated in v11 for `.get()` and `.watch()` are now removed:
- `this.storage.get<User>('user')` (add a JSON schema or remove the cast)
- `this.storage.get('user', { type: 'object' })` (cast is required in addition to the JSON schema for non-primitive types)
- `this.storage.get<number>('name', { type: 'string' })` (and all other primitive mismatches)

See the [migration guide for v11](./MIGRATION_TO_V11.md) for detailed instructions.

### ViewEngine support removed

Angular 2-8 internal engine was named ViewEngine.
It was replaced automatically by a new engine called Ivy in Angular 9.

While Angular 9-11 still allowed to manually switch back to ViewEngine, Angular 12 has removed ViewEngine support. So now libraries are compiled directly for Ivy.

## Other changes

### Internet Explorer 11 support deprecated

Angular 12 deprecates IE 11 support. Meaning it's still supported,
but it will be removed in version 13.

## More documentation

- [Full changelog for v12](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
