# Migration guide to the new package

This lib has been renamed from `angular-async-local-storage` to **`@ngx-pwa/local-storage`**.

But **do not worry: the previous package is still here** and will be as long as npm exists.
Migration to the new package is recommended as soon as possible to enjoy bug fixes and new features,
but is not required for Angular 4 & 5. **It is only required when upgrading to Angular >= 6.**

## Version alignment

The lib major version is now aligned to the major version of Angular. Meaning you need:
- v4 for Angular 4,
- v5 for Angular 5,
- v6 for Angular 6,
- v7 for Angular 7.

Note that Angular 4 LTS support has ended.

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

- for **Angular 6**:
```bash
npm install @ngx-pwa/local-storage@6
```

## Refactoring

Then, **do a global search of `angular-async-local-storage` in your project, and replace with `@ngx-pwa/local-storage`**.

Finally, you can uninstall the previous package:
```bash
npm uninstall angular-async-local-storage
```

Done.

## Code changes

There is **no code change in v4 and v5**.

There are code changes if you're upgrading to Angular >=6, see [the other migration guides](../MIGRATION.md).

## More documentation

- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
