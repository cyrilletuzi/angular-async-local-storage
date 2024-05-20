# Changelog

This library is fully documented and so you will find detailed [migration guides](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/MIGRATION.md).

## 18.0.0 (2024-05-20)

### Breaking changes

- Angular 18 is required.
- RxJS >= 7.4 is required. RxJS 6 is not supported.
- Made internal properties and methods of `StorageMap` natively private (`#property`) instead of protected. Extending `StorageMap` was undocumented so it is not considered a breaking change.

## 17.0.0 (2023-11-08)

### Breaking changes

- Angular 17 is required.
- RxJS >= 7.4 is required. RxJS 6 is not supported.
- All things deprecated in v16 are removed in v17:
  - `LocalStorage` service
  - specific `JSONSchemaXXX` interfaces
  - `JSONValidator`
  - `LocalDatabase`

See the [migration guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V17.md).

## 16.3.0 (2023-06-04)

- Specific `JSONSchemaXXX` interfaces are deprecated and will be removed in version 17. They were introduced in very old versions of this library as a workaround to some TypeScript issues which are gone for a long time now. Since version 8, you should have used the generic `JSONSchema` interface. Note that if you are using `JSONSchemaArray` for a tuple schema, you need to switch to `JSONSchema` now because of the fix in version 16.2.0.

- `JSONValidator` is deprecated and will no longer be available in version 17. It is an internal utility class which is limited, could change at any time and is out of scope of this library. If you need a JSON validator, there are far better and dedicated libraries available like [ajv](https://ajv.js.org/).

- `LocalDatabase` is deprecated and will no longer be available in version 17. It is an internal utility class, and overriding it is an undocumented behavior. If you are doing so, you are basically rewriting your own storage library, so using this one makes no sense, you can your service directly.

## 16.2.0 (2023-06-04)

Little adapatation of the `JSONSchema` type for compatibility with `@sinclair/typebox`. You will find a new way to validate with this library in the [validation guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md).

## 16.1.0 (2023-05-23)

`LocalStorage` service is deprecated and will be removed in v17. The `StorageMap` replacement exists since v8 now, so it is time to move forward. As usual, see the [migration guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V16.md).

## 16.0.0 (2023-05-03)

### Breaking changes

- Angular 16 is required.
- RxJS >= 7.4 is required. RxJS 6 is not supported.
- TypeScript 5.0 is recommended (TypeScript 4.9 should work but is not tested).

## 15.0.0 (2022-12-16)

### Breaking changes

- Angular 15 is required.
- RxJS >= 7.4 is required. RxJS 6 is not supported.

### Deprecation

Advanced configuration via `StorageModule.forRoot()` is deprecated.

Use the new `provideXXX()` methods as shown in the [interoperability](./docs/INTEROPERABILITY.md) or [collision](./docs/COLLISION.md) guides, depending on your case.

This aligns with the new standalone APIs in Angular 15.

## 14.0.0 (2022-12-16)

Version published by error, use v13 for Angular 13 and 14 and use v15 for Angular 15.

## 13.0.6 (2022-12-16)

`peerDependencies` restricted to Angular 13 and 14. Version 15 has been released for Angular 15.

## 13.0.2 (2021-11-23)

Fix schematic for "ng add" for Angular 13.

## 13.0.1 (2021-11-19)

Just a documentation update.

## 13.0.0 (2021-11-04)

### Feature

Supports and **requires** Angular 13.

### Breaking changes

#### RxJS 7

For some reasons, Angular 13 supports both RxJS >= 6.5.3 or >= 7.4. It can be difficult for library authors to support multiple versions at the same time.

So while *for now* the library still allows RxJS 6 in its `peerDependencies` as CI tests seem to be fine, be aware **we do not guarantee RxJS 6 support**. v13 of the library is built with RxJS 7, and you should upgrade your app to RxJS >= 7.4 too.

#### Internet Explorer 11 is dead

Angular 13 dropped Internet Explorer support, and so this library too.

## 12.1.0 (2021-08-05)

### Feature

Allow RxJS 7 in peerDependencies, to align with Angular 12.2.

Note that Angular and this library are still built with RxJS 6,
so while the tests with RxJS 7 seem to pass,
be cautious if you want to upgrade RxJS right now without waiting for Angular 13.

### Other change

While it may still work, Angular 9 LTS has ended, so it is not officially supported anymore.

## 12.0.0 (2021-05-13)

```bash
ng update @ngx-pwa/local-storage
```

A [full migration guide to version 12](https://github.com/cyrilletuzi/angular-async-local-storage/blob/v12/docs/MIGRATION_TO_V12.md) is available.

**If you did not update to version 9 yet, be sure to follow the migration guide, as otherwise you could lose all previously stored data**.

### Feature

Supports and **requires** Angular 12.

### Breaking changes

#### Typings

Incorrect typings that were deprecated in v11 for `.get()` and `.watch()` are now removed:
- `this.storage.get<User>('user')` (add a JSON schema or remove the cast)
- `this.storage.get('user', { type: 'object' })` (cast is required in addition to the JSON schema for non-primitive types)
- `this.storage.get<number>('name', { type: 'string' })` (and all other primitive mismatches)

See the [migration guide for v11](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V11.md) for detailed instructions.

#### ViewEngine support removed

Angular 2-8 internal engine was named ViewEngine.
It was replaced automatically by a new engine called Ivy in Angular 9.

While Angular 9-11 still allowed to manually switch back to ViewEngine, Angular 12 has removed ViewEngine support. So now libraries are compiled directly for Ivy.

### Other changes

#### Internet Explorer 11 support deprecated

Angular 12 deprecates IE 11 support. Meaning it is still supported, but it will be removed in version 13.

## 11.1.0 (2021-01-21)

No library change, just rebuilt with Angular 11.1 (still compatible with Angular 11.0).

## 11.0.2 (2020-12-23)

No library change, just a fix in schematics to avoid `ng add` breaking with Angular 11.1.

## 11.0.1 (2020-11-13)

No change, just a release to update link to new `main` branch.

## 11.0.0 (2020-11-12)

A [full migration guide to version 11](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V11.md) is available.

**If you did not update to version 9 yet, be sure to follow it, as otherwise you could lose all previously stored data**.

### Feature

Supports and **requires** Angular 11.

### Typings

TypeScript typings for `.get()` and `.watch()` has been modified to better match the library behavior.

For now, wrong usages are just marked as deprecated, so there is **no breaking change**
and it will just be reported by linters. But they may be removed in future releases.

Be sure to read the [validation guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md) for all the why and how of validation.

1. **Cast without a JSON schema**

```ts
this.storage.get<User>('user');
```
was allowed but the result was still `unknown`.

This is a very common misconception of client-side storage:
you can store and get anything in storage, so many people think that casting as above
is enough to get the right result type. It is not.

Why? Because you are getting data from *client-side* storage:
so it may have been modified (just go to your browser developer tools and hack what you want).

A cast is just an information for *compilation*:
it basically says to TypeScript: "believe me, it will be a `User`".
But **that's not true: you are not sure you will get a `User`**.

This is why this library provides a *runtime* validation system,
via a JSON schema as the second parameter:

```ts
this.storage.get<User>('user', {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
});
```

2. **Non-primitive JSON schema without a cast**

```ts
this.storage.get('user', {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
});
```
was allowed but the result was still `unknown`.

This is because, for now, the library is able to infer the return type based on the JSON schema
for primitives (`string`, `number`, `integer`, `boolean` and `array` of these),
but not for more complex structures like objects.

So in this case, both the JSON schema and the cast are required:

```ts
this.storage.get<User>('user', {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
});
```

Be aware **you are responsible the casted type (`User`) describes the same structure as the JSON schema**.
For the same reason, the library cannot check that.

Auto-inferring the type from all JSON schemas is in progress in
[#463](https://github.com/cyrilletuzi/angular-async-local-storage/issues/463]).

3. **Mismatch between cast and primitive JSON schema**

```ts
this.storage.get<number>('name', { type: 'string' });
```
was allowed but is of course an error. Now the match between the cast and simple JSON schemas (`string`, `number`, `integer`, `boolean` and `array` of these) is checked.

Note that in this scenario, the cast is not needed at all, it will be automatically inferred by the lib, so just do:

```ts
this.storage.get('name', { type: 'string' });
```

4. **JSON schema with `as const` assertion**

Given how JSON schema works, sometimes it is better to set them `as const`:

```ts
this.storage.get('name', { type: 'string' } as const);
```

But before v11, it was not possible when using some JSON schema properties
(`enum`, `items`, `required`). This is now fixed.

## 10.1.0 (2020-09-03)

No code change, just rebuilt with Angular 10.1.

## 10.0.1 (2020-07-11)

### Bug fix

Correctly propagate the browser error when trying to store a value exceeding the browser size limit.

## 10.0.0 (2020-06-25)

### Feature

Supports and **requires** Angular 10.

No library change.

A [full migration guide to version 10](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V10.md) is available.

**If you did not update to version 9 yet, be sure to follow it, as otherwise you could lose all previously stored data**.

## 9.0.3 (2020-03-13)

No code change, just rebuilt with very last Angular 9.0.6 to prevent any `ngcc` issues.

## 9.0.2 (2020-02-07)

### Bug fix

If you were already using version >= v9.0.0-beta.4 or v9.0.0-rc.x of this lib,
**as a one time exception**, please update with a classic `npm install @ngx-pwa/local-storage@9`,
to avoid migration happening twice.

For future v9+ updates and if you are coming from v8.0.0 or version v9.0.0-beta.1-3,
please stick to `ng update @ngx-pwa/local-storage`.

Following these instructions is very important, otherwise it would result in wrong config
and loss of previously stored data.

## 9.0.0 (2020-02-07)

A [full migration guide to version 9](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V9.md) is available.

**Be sure to follow it, as otherwise you could lose all previously stored data**.

### Angular 9

v9 requires Angular 9.

### Breaking change: internal storage change

Doing `ng update` should have managed backward compatibility.
But it is not easy to be sure schematics work in all cases,
so **be sure to check the migration was done correctly** by following the
[migration guide to v9](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V9.md), **otherwise you would lost previously stored data**.

### Feature

- New `.watch()` method on `StorageMap` service
(see [documentation](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/WATCHING.md))

### Breaking changes: removal of deprecated features

The following APIs were already deprecated in v8 and are now removed in v9.
Please follow the [migration guide to v8](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MIGRATION_TO_V8.md) for more details about how to update to new APIs.

- Removed providers for prefix management
  - **If you are concerned, be very careful with this migration, otherwise you could lost previously stored data**
  - `{ provide: LOCAL_STORAGE_PREFIX, useValue: 'myapp' }` and `localStorageProviders()` (use `StorageModule.forRoot({ LSPrefix: 'myapp_', IDBDBName: 'myapp_ngStorage' })` module import instead)
  - `LocalStorageProvidersConfig` interface (useless)
- Removed APIs in validation
  - `JSONSchemaNumeric` interface (use `JSONSchema` instead)
  - `LSGetItemOptions` interface (useless)
- Removed methods in `LocalStorage` service
  - `.size` (use `.length` or `StorageMap.size` instead)
  - `.has()` (use `StorageMap.has()` instead)
  - `.keys()` (use *iterative* `StorageMap.keys()` instead)
  - `.setItemSubscribe()` (use `.setItem().subscribe()` instead)
  - `.removeItemSubscribe()` (use `.removeItem().subscribe()` instead)
  - `.clearSubscribe()` (use `.clear().subscribe()` instead)

## 8.2.4 (2020-01-13)

No code change, just a release built with last Angular 8.
Probably the last before Angular 9.

Also, documentation about [sponsorship](https://github.com/sponsors/cyrilletuzi).

## 8.2.3 (2019-09-27)

### Bug fix

- `.size` in now working in Firefox private mode

### Tests

The repo has moved from CircleCI to GitHub Actions.
So it is free and a lot easier to test on several configurations, and now the library is tested for each pull request on:
- Chrome (Ubuntu & Windows)
- Firefox (Ubuntu & Windows)
- Safari (macOS)
- IE (Windows)
- in private mode of Chrome, Firefox and IE

Previously, the library was only automatically tested in Chrome and Firefox on Ubuntu, in normal mode (other configs were tested manually).

## 8.2.2 (2019-09-01)

### Bug fix

- Fix a regression introduced in 8.2.0, causing the library to fail instead of falling back to other storages in Firefox private mode

## 8.2.1 (2019-08-20)

### Features

- Support for `ng add @ngx-pwa/local-storage` (for versions >= 8)
- Support for `ng update @ngx-pwa/local-storage`
(it does not mean you do not have work to do when updating, be sure to follow the [migrations guides](./MIGRATION.md))

### Error management

Before v8.2.0, this library was listening to `indexedDb` *request* `success` event.
Now it is listening to *transaction* `complete` event.

Except for the special `.keys()` method, all other methods in this library are doing just one request by transaction.
So request `success` or transaction `complete` are supposed to be equivalent. But there are rare cases like
[#162](https://github.com/cyrilletuzi/angular-async-local-storage/issues/162)
where the transaction could fail even if the request succeeded (meaning the data will not be written on disk).

So now it should catch more rare edgy cases, but for nearly everyone it should not change anything.
But it is still a sensitive change as it concerns asynchrony (the order of operations are not exactly the same).

## 8.1.0 (2019-08-17)

### Performance

- Simpler and quicker way to store a value with `indexedDb`

## 6.2.5 & 8.0.2 (2019-06-19)

### Bug fix

- Same fix as previous release, but makes it work for all browsers
(fixes [#118](https://github.com/cyrilletuzi/angular-async-local-storage/issues/118))

## 6.2.4 & 8.0.1 (2019-06-05)

### Bug fix

- When storage is fully disabled in browser (via the "Block all cookies" option),
just trying to check `indexedDB` or `localStorage` variables causes a security exception,
and all Angular code will fail. So the library is now catching the error,
and fallbacks to in-memory storage in this case.

## 8.0.0 (2019-05-29)

**A [full migration guide to version 8](./docs/MIGRATION_TO_V8.md) is available.**

### Angular 8

v8 requires Angular 8.

### Feature: new `StorageMap` service

See the [general documentation](./README.md).

### Feature: validation is much easier!

- The schema used for validation can (and should) be passed directly as the second argument of `getItem()`
- The returned type of `getItem()` is now inferred for basic types (`string`, `number`, `boolean`) and arrays of basic types (`string[]`, `number[]`, `boolean[]`)
- Just use the new `JSONSchema` interface, IntelliSense will adjust itself based on the `type` option

See the new [validation guide](./docs/VALIDATION.md).

### Full review

This library started as a little project and is now the first Angular library used for client-side storage.
It was time to do a full review and refactoring, which results in:

- Better error management (see [README](./README.md#errors))
- Better documentation
- Better overall code (= easier to contribute)

### Other features

- `indexedDB` database and object store names default values are exported and can be changed
(see the [interoperability guide](./docs/INTEROPERABILITY.md))
- When trying to store `null` or `undefined`, `removeItem()` instead of just bypassing (meaning the old value was kept)

### Breaking changes

- **`type` now required for array, object, const and enum validation schemas**
- `JSONSchemaNull` removed (useless, `null` does not require any validation)
- `JSONSchema` no longer accepts extra properties
- `getUnsafeItem()` is removed (was already deprecated in v7)

### Future breaking changes

- `.has()`, `.keys()` and `.size` are deprecated in `LocalStorage`. They will be removed in v9. They moved to the new `StorageMap` service.
- `JSONSchemaNumeric` deprecated (will be removed in v9)
- `LSGetItemsOptions` deprecated (not necessary anymore, will be removed in v9)
- `LOCAL_STORAGE_PREFIX`, `LocalStorageProvidersConfig` and `localStorageProviders()` deprecated (will be removed in v9). Moved to `StorageModule.forRoot()`
- `setItemSubscribe()`, `removeItemSubscribe()` and `clearSubscribe()` deprecated (will be removed in v9)

### Reduced public API

Should not concern you as it was internal stuff.

- `IndexedDBDatabase` and `LocalStorageDatabase` not exported anymore
- `MockLocalDatabase` renamed and not exported anymore

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

- `has()` and `keys()` now work in IE too
(fixes [#69](https://github.com/cyrilletuzi/angular-async-local-storage/issues/69))

Do *not* use: it is deprecated in v8.

## 7.3.0 (2019-01-03)

### Feature

- `getItem()` and `setItem()` will now work with values stored from elsewhere
(ie. via the native APIs or via another library like `localForage`), given some limitations and adaptations
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

In v7.2, `has()` and `keys()` were not supported in Internet Explorer. Update to v7.4.

Do *not* use: it is deprecated in v8.

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
  - `JSONSchemaNumeric` (deprecated in v8)
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

- `localStorageProviders({ prefix: 'myapp' })` to avoid collision in multiple apps on same subdomain 

### Breaking changes

A [migration guide](./docs/MIGRATION_TO_V6.md)
is available to ease the update. It is just a couple of refactorings.
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

This library has been renamed from `angular-async-local-storage` to `@ngx-pwa/local-storage`. See the [migration guide](./docs/MIGRATION_TO_NEW_PACKAGE.md).

### Version alignement

This library major version is now aligned to the major version of Angular. Meaning this v5 is for Angular 5. Same as v3.1.4.

## 4.0.0 (lts) (2018-04-03)

### New package name

This library has been renamed from `angular-async-local-storage` to `@ngx-pwa/local-storage`. See the [migration guide](./docs/MIGRATION_TO_NEW_PACKAGE.md).

### Version alignement

This library major version is now aligned to the major version of Angular. Meaning this v4 is for Angular 4. Same as v2.

We follow [Angular LTS support](https://github.com/angular/angular/blob/main/docs/RELEASE_SCHEDULE.md),
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

- Initial release : asynchronous client-side storage module for Angular
- Up to date with Angular 2.1
- Compatible with AoT pre-compiling
- Compatible with Universal server-side rendering
- IE9 support via native localStorage (public API still asynchronous but synchronous internally)
