# Changelog

This lib is fully documented and so you'll find detailed [migration guides](./MIGRATION.md).

## 8.0.0-beta.x

v8 development is tracked in [#76](https://github.com/cyrilletuzi/angular-async-local-storage/pull/76).

This will be an important release so **beta testers are very welcomed.**

## 7.4.1 (2019-01-27) / 5.3.6 and 6.2.3 and 7.4.2 (2019-02-25)

### Documentation

- No code change, only changes in documentation to prepare changes in v8 by recommending to:
  - explicit `type` in every JSON schema, especially `type: 'array'` and `type: 'object'` which were optional but will be required in v8
  - prefer the generic `JSONSchema` interface (v7 only)
  - avoid constants and enums validation (v7 only)
  - avoid `null` in JSON schemas
  - avoid adding unsupported extra properties in JSON schemas
  - use `localStorageProviders()` for configuration instead of `LOCAL_STORAGE_PREFIX`

## 7.4.0 (2019-01-12)

### Feature

- `has()` and `keys()` now work in Edge/IE too
(fixes [#69](https://github.com/cyrilletuzi/angular-async-local-storage/issues/69))

## 7.3.0 (2019-01-03)

### Feature

- `getItem()` and `setItem()` will now work with values stored from elsewhere
(ie. via the native APIs or via another lib like `localForage`), given some limitations and adaptations
(see the [interoperability documentation](./docs/INTEROPERABILITY.md))
(fixes [#65](https://github.com/cyrilletuzi/angular-async-local-storage/issues/65))

## 5.3.3 and 6.2.2 and 7.2.2 (2019-01-02)

### Bug fix

- Avoid throwing when storing `undefined` in `localStorage` fallback

## 5.3.2 and 6.2.1 and 7.2.1 (2018-12-12)

### Bug fix

- Correct validation for required vs optional properties (fixes [#63](https://github.com/cyrilletuzi/angular-async-local-storage/issues/63))

## 7.2.0 (2018-11-27)

### Feature

- Added a partial `Map`-like API:
  - `.keys()` method
  - `.has(key)` method
  - `.size` property

In v7.2, `has()` and `keys()` were not supported in Internet Explorer and Edge. Update to v7.4.

See [documentation](./docs/MAP_OPERATIONS.md).

### Breaking change (from v7.1 only)

One of the features released in 7.1 caused an unforeseen critical regression.
As it concerned only a minor feature introduced in 7.1, released only 4 days ago
(so probably no one is using it yet), decision has been made to do an exceptional breaking change
of this just released minor feature, before it was too late.

- `keys()` is now returning `Observable<string[]>` (returning directly an array with all keys)
instead of `Observable<string>` (it was iterating over the keys).

[Documentation](./docs/MAP_OPERATIONS.md) has been updated accordingly.

## 7.1.0 (2018-11-23) & 7.1.1 (2018-11-26)

These releases have been **deprecated** due to a critical regression.

## 7.0.0 (2018-10-19)

- Support of Angular 7

### Feature

- New interfaces for better validation of your JSON schemas:
  - `JSONSchemaConst`
  - `JSONSchemaEnum`
  - `JSONSchemaString`
  - `JSONSchemaNumeric`
  - `JSONSchemaBoolean`
  - `JSONSchemaArray`
  - `JSONSchemaObject`

See the [full validation guide](./docs/VALIDATION.md) for more info.

### Breaking change

A [migration guide to version 7](./docs/MIGRATION_TO_V7.md) is available.
**Be sure to read it before upgrading**, as v7 introduces an important major change.
Validation of data is now required when using `getItem()`:

- `getItem<string>('test', { schema: { type: 'string' } })`: no change

- `getItem<string>('test')`: now returns the new TypeScript 3 `unknown` type instead of `any`, requiring from you to check the data manually

**Migration is not urgent: while you manage this breaking change, you can just upgrade to v6.2.0, which is compatible with Angular 7.**

## 6.2.0 (2018-10-19)

### Feature

- Allow Angular 7 in `peerDependencies`

## 6.1.1 and 5.3.1 (2018-09-29)

### Bug fix

- Fixed `IndexedDB setter issue : Key already exists in the object store` when there are concurrent `setItem` calls
(note this situation should *not* happen, see [#47](https://github.com/cyrilletuzi/angular-async-local-storage/issues/47) for details)

## 6.1.0 (2018-08-13)

### Feature

- Fallback to `localStorage` if `IndexedDb` connection fails (fixes
[#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26) and
[#42](https://github.com/cyrilletuzi/angular-async-local-storage/issues/42))

## 6.0.0 (2018-07-26)

### Features

- New JSON Schema validation options supported (see [#18](https://github.com/cyrilletuzi/angular-async-local-storage/issues/18) for the full list).

- `setItemSubscribe()`, `removeItemSubscribe()`, `clearSubscribe()` methods for auto-subscription

- `localStorageProviders({ prefix: 'myapp' })` to avoid collision in multiple apps on same subdomain 

### Breaking changes

A [migration guide](./docs/MIGRATION_TO_V6.md)
is available to ease the update. It's just a couple of refactorings.
(If you want to contribute,
[it could be automated](https://github.com/cyrilletuzi/angular-async-local-storage/issues/31).)

#### New requirements

#### Supported version

- Angular 6
- TypeScript 2.7, 2.8 & 2.9

#### New classes names

- `AsyncLocalStorage` removed, renamed to `LocalStorage`.
- `AsyncLocalDatabase` removed, renamed to `LocalDatabase`.
- `ALSGetItemOptions` removed, renamed to `LSGetItemOptions`.

#### No more `LocalStorageModule`

`LocalStorageModule` no longer needed and so removed. **You must delete the import in your `AppModule`.**

#### Validation

- To be consistent with the strict validation, and to prepare future enhancement of JSON Schema typings,
it is no longer possible to specify an array for `type`.
- `JSONSchemaType` has been removed. It should very unlikely concern you, it was an internal type.

#### Others

- Distribution files and directories have been changed to match
official [Angular Package Format v6](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/edit).
It affects your code only if you were manually loading UMD bundles,
otherwise building tools like Angular CLI / webpack know where to find the files.

### Internal changes for better performance

- Tree-shakable providers.
- Full support of official [Angular Package Format v6](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/edit)

## 6.0.0-rc.2 (2018-07-23)

### Breaking change

- Distribution files and directories have been changed to match
official [Angular Package Format v6](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/edit).
It affects your code only if you were manually loading UMD bundles,
otherwise building tools like Angular CLI / webpack know where to find the files.

## 6.0.0-rc.1 (2018-07-11)

### Bug fix

- `localStorageProviders({ prefix: 'myapp' })` feature was adding the prefix twice.

### Breaking change

- If you were using previous v6 RC (v5 is not concerned) and relying on the `prefix` option above,
your app will restart from empty data.
If you want to keep your previous data, double the prefix, for example: `localStorageProviders({ prefix: 'myapp_myapp' })`

## 5.3.0 (2018-05-03)

### Feature

- `localStorageProviders({ prefix: 'myapp' })` to avoid collision in multiple apps on same subdomain

## 5.2.0 (2018-04-08)

### Feature

- `setItemSubscribe()`, `removeItemSubscribe()`, `clearSubscribe()` methods for auto-subscription

## 5.1.1 (2018-04-07)

### Bug fix

- Correct too wide type inference for `getItem()`

## 5.1.0 and 4.1.0 (2018-04-07)

### Refactoring

- `AsyncLocalStorageModule` deprecated (but still working). Renamed to `LocalStorageModule`
- `AsyncLocalStorage` deprecated (but still working). Renamed to `LocalStorage`
- `AsyncLocalDatabase` deprecated (but still working). Renamed to `LocalDatabase`
- `ALSGetItemOptions` deprecated (but still working). Renamed to `LSGetItemOptions`

See the [migration guides](./MIGRATION.md).

## 5.0.0 (2018-04-03)

### New package name

This lib has been renamed from `angular-async-local-storage` to `@ngx-pwa/local-storage`. See the [migration guide](./docs/MIGRATION_TO_NEW_PACKAGE.md).

### Version alignement

This lib major version is now aligned to the major version of Angular. Meaning this v5 is for Angular 5. Same as v3.1.4.

## 4.0.0 (lts) (2018-04-03)

### New package name

This lib has been renamed from `angular-async-local-storage` to `@ngx-pwa/local-storage`. See the [migration guide](./docs/MIGRATION_TO_NEW_PACKAGE.md).

### Version alignement

This lib major version is now aligned to the major version of Angular. Meaning this v4 is for Angular 4. Same as v2.

We follow [Angular LTS support](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md),
meaning we support Angular 4 until October 2018. So we backported some bug fixes:

- Detect if storages are null or undefined (partially fixes (partially fixes [#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26))
- Correctly complete observables (fixes [#25](https://github.com/cyrilletuzi/angular-async-local-storage/issues/25) & [#5](https://github.com/cyrilletuzi/angular-async-local-storage/issues/5))
- Some IndexedDB connection errors were not caught

***

Previous versions were only released under `angular-async-local-storage`.

***

## 3.1.4 (2018-03-24)

### Bug fix

- Detect if storages are null (partially fixes [#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26))

## 3.1.3 (2018-03-23)

### Bug fix

- Detect if storages are undefined (partially fixes [#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26))

## 3.1.2 (2018-03-23)

### Bug fix

- Correctly complete observables (fixes [#25](https://github.com/cyrilletuzi/angular-async-local-storage/issues/25) & [#5](https://github.com/cyrilletuzi/angular-async-local-storage/issues/5))

## 3.1.1 (2018-01-04)

### Bug fixes

- Some IndexedDB connection errors were not caught
- Browser info has been added for IndexedDB errors

## 3.1.0 (2017-11-29)

### Features

- JSON Schema validation
- Extensibility : add your own storage

See README for instructions.

## 3.0.0 (2017-11-03)

### Breaking changes

- Angular 5 is now supported and required
- RxJS >= 5.5.2 is now supported and required : [lettable operators](https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md)

## 2.0.1 (2017-10-03)

### Bug fix

- RxJS operators can now be used again on returned observables (fixes [#10](https://github.com/cyrilletuzi/angular-async-local-storage/issues/10))

## 2.0.0 (2017-09-16)

### Features

- Implements [Angular Package Format](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/)
  - Compatible with Universal builds from Angular CLI >= 1.3 (fixes [#9](https://github.com/cyrilletuzi/angular-async-local-storage/issues/9))
  - Compatible with ES2015+ target builds (= smaller builds)
- Better type checking with generics : `this.storage.getItem<string>('color')`

### Breaking changes

- Angular 4 is now required
- TypeScript >= 2.3 is now required

### Under the hood

- Use Angular 4 platform tests to detect storages support instead of try/catch
- Unit tests

## 1.4.0 (2017-04-01)

### Features

- Up to date with Angular 4.0

## 1.3.0 (2016-12-27)

### Features

- Rename package to angular-async-local-storage

***

Previous versions were only released under `angular2-async-local-storage`.

***

## 1.2.0 (2016-12-20)

### Features

- Up to date with Angular 2.4 and RxJS final

## 1.1.1 (2016-12-19)

### Bug fixes

- Recompiled with Angular 2.3.1, following [Angular changelog advice](https://github.com/angular/angular/blob/master/CHANGELOG.md#231-2016-12-15)

## 1.1.0 (2016-12-09)

### Features

- Up to date with Angular 2.3
- Update peerDependencies :
  - reflect-metadata 0.1.8
  - rxjs 5.0.0-rc.4
  - zone.js 0.7.2

## 1.0.2 (2016-11-01)

### Bug fixes

- allow falsy values in mock database

## 1.0.1 (2016-11-01)

### Bug fixes

- null instead of undefined for unexisting item in mock database

## 1.0.0 (2016-10-31)

### Features

- Initial release : asynchronous local storage module for Angular
- Up to date with Angular 2.1
- Compatible with AoT pre-compiling
- Compatible with Universal server-side rendering
- IE9 support via native localStorage (public API still asynchronous but synchronous internally)
