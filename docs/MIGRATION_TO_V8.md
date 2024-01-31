# Migration guide to version 8

## LTS support ended

[Angular version 8 is officially outdated](https://angular.dev/reference/versions).

## Foreword

Version 8 of this library is a big update for 2 reasons:

1. One was beyond my control: it follows a regression in TypeScript 3.2 (see [#64](https://github.com/cyrilletuzi/angular-async-local-storage/issues/64)). The worst part was the TS team support: the regression would be solved only in TypeScript 3.4. As a consequence, decision was made to change the `JSONSchema` interface
to not be dependent on unreliable edgy TypeScript behavior anymore.

2. This library was born some years ago with Angular 2. What was a little project grew up a lot and is now downloaded dozens of thousands of times on `npm`  each week. It was time to do a full review (and rewrite).

So yes, there are a lot of changes, but it is for good:
- many things (like validation) have been simplified
- more advanced and some long-awaited features (like watching an item [#108](https://github.com/cyrilletuzi/angular-async-local-storage/pull/108)) are now possible
- errors are managed in a better way, fixing many edgy cases
- and more!

But relax, to ease the migration:
- **there are few breaking changes, so updating to v8 should be easy**
- but there are a lot of deprecations, so preparing for v9 (were deprecations of v8 will be removed) will take more time.

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.dev/reference/versions):

> If you are updating from one major version to another, then we recommend that you do not skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 6.x.x to version 8.x.x, we recommend that you update to the latest 7.x.x release first. After successfully updating to 7.x.x, you can then update to 8.x.x.

Exceptionally, this library deprecated the v7 version, so migration to version 7 is not required. But be aware that since v7, **validation is now required in `getItem()`**. A full [validation guide](./VALIDATION.md) is available.

Conversely, migration to version 6 is important.

**So if you update from version < 7, please do the [other migrations](../MIGRATION.md) first**.

## How to update

Then:

1. Update the lib:
```
ng update @ngx-pwa/local-storage
```

Check that `StorageModule.forRoot({ IDBNoWrap: false })` was added in `AppModule` imports of each project (for backward compatibility).

**If `ng update` did not work as expected, please delay the update and file an issue.**

If you have multiple applications in your project but you do not use this library in all projects, remove `StorageModule.forRoot({ IDBNoWrap: false })` and the import in the unconcerned `AppModule`s.

2. Start your project: problems will be seen at compilation. Or you could search for `getItem` as most breaking changes are about its options.

## The bad part: breaking changes

**The following changes may require action from you**.

The main change is to add `type` to all your JSON schemas.

### Validation of arrays

**`type` option is now required.**

Before v8, `type` was optional:
```typescript
this.localStorage.getItem('test', { schema: {
  items: { type: 'string' }
} })
```

Since v8:
```typescript
this.localStorage.getItem('test', {
  type: 'array',
  items: { type: 'string' }
})
```

### Validation of objects

**`type` option is now required.**

Before v8, `type` was optional:
```typescript
this.localStorage.getItem('test', { schema: {
  properties: {
    test: { type: 'string' }
  }
} })
```

Since v8:
```typescript
this.localStorage.getItem('test', {
  type: 'object',
  properties: {
    test: { type: 'string' }
  }
})
```

### Validation of constants

`const` is now an option in `JSONSchema` (for `type`: `string`, `number`, `integer` or `boolean`), meaning you must add the `type`.

Before v8:
```typescript
this.localStorage.getItem('test', { schema: { const: 'value' } })
```

Since v8:
```typescript
this.localStorage.getItem('test', { type: 'string', const: 'value' })
```

Also, `JSONSchemaConst` interface is removed.

### Validation of enums

`enum` is now an option in `JSONSchema` (for `type`: `string`, `number` or `integer`), meaning you must add the `type`.

Before v8:
```typescript
this.localStorage.getItem('test', { schema: { enum: ['value 1', 'value 2'] } })
```

Since v8:
```typescript
this.localStorage.getItem('test', { type: 'string', enum: ['value 1', 'value 2'] })
```

It also means enums of different types are no longer possible (and it is better for consistency).

Also, `JSONSchemaEnum` interface is removed.

### `JSONSchemaNull` removed

`JSONSchemaNull` is removed (it was useless, as if the data is `null`, validation does not occur).

### Additional properties in schemas

The `schema` option of `getItem()` now only accepts our own `JSONSchema` interface, which is a subset of the JSON Schema standard.

This library has always discarded some features of the standard, as it uses the schemas for a specific purpose (validation). But before v8, extra properties in the schema were accepted even if not supported. It is no longer possible since v8 due to TypeScript limitations.

## Feature: new `StorageMap` service

In addition to the `LocalStorage` service, a new `StorageMap` service has been added:

```typescript
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private storage: StorageMap) {}

}
```

This service API follows the standard [`Map` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), except it is based on [RxJS `Observable`s](https://rxjs.dev/).

```typescript
class StorageMap {
  size: Observable<number>;
  get(index: string, schema?: JSONSchema): Observable<unknown> {}
  set(index: string, value: any): Observable<undefined> {}
  delete(index: string): Observable<undefined> {}
  clear(): Observable<undefined> {}
  has(index: string): Observable<boolean> {}
  keys(): Observable<string> {}
}
```

It does the same thing as the `localStorage` API, but also allows more advanced operations.

It is now the recommended service, and the following example will use it to make you familiar with it:
- `this.storageMap.get()` is the same as `this.localStorage.getItem()`
- `this.storageMap.set()` is the same as `this.localStorage.setItem()`
- `this.storageMap.delete()` is the same as `this.localStorage.removeItem()`
- `this.storageMap.clear()` is the same as `this.localStorage.clear()`

Just one difference on the return value when the requested key does not exist:
- `undefined` with `StorageMap`
```typescript
this.storageMap.get('notexisting').subscribe((data) => {
  data; // undefined
});
```
- `null` with `LocalStorage`
```typescript
this.localStorage.getItem('notexisting').subscribe((data) => {
  data; // null
});
```

## The good part: simplification changes

### Easier API for `get()`

`get()` API has been simplified: the secong argument is now directly the schema for validation.

Before v8:
```typescript
this.localStorage.getItem<string>('test', { schema: { type: 'string' } })
```

Since v8:
```typescript
this.storageMap.get('test', { type: 'string' })
```

Passing the schema via an object is deprecated and will be removed in v9. So this change is strongly recommended.

### Cast now inferred!

The previous change allows that the returned type of `get()` is now inferred for basic types (`string`, `number`, `boolean`) and arrays of basic types (`string[]`, `number[]`, `boolean[]`).

Before v8:
```typescript
this.localStorage.getItem('test', { schema: { type: 'string' } }).subscribe((data) => {
  data; // any :(
});

this.localStorage.getItem<string>('test', { schema: { type: 'string' } }).subscribe((data) => {
  data; // string :)
});
```

Since v8:
```typescript
this.storageMap.get('test', { type: 'string' }).subscribe((data) => {
  data; // string :D
});
```

Cast is still needed for objects. Follow the new [validation guide](./VALIDATION.md).

## Deprecations

Version 8 is a fresh new start, where everything has been cleaned. But as the previous changes already require quite some work, **the following features still work in v8 but are deprecated**. They will be removed in v9.

### `Map`-like operations

`Map`-like methods introduced in v7.2 has been moved to the new `StorageMap` service:
- `.keys()`
- `.has(key)`
- `.size`

Before v8:
```typescript
this.localStorage.has('somekey').subscribe((result) => {});
```

Since v8:
```typescript
this.storageMap.has('somekey').subscribe((result) => {});
```

They are still in the `LocalStorage` service but deprecated. They will be removed from this service in v9.

### `keys()` is now iterating

While the deprecated `keys()` in `LocalStorage` service gives all the keys at once as an array, `keys()` in the new `StorageMap` service is now *iterating* over the keys, which is better for performance and easier to managed advanced operations (like the multiple databases scenario).

Follow the updated [`Map` operations guide](./MAP_OPERATIONS.md).

While *not* recommended, you can get the same behavior as before by doing this:
```typescript
import { toArray } from 'rxjs/operators';

this.storage.keys().pipe(toArray()).subscribe((keys) => {});
```

### Use the generic `JSONSchema`

Now the `JSONSchema` interface has been refactored, just use this one. IntelliSense will adjust itself based on the `type` option. The specific interfaces (`JSONSchemaString`, `JSONSchemaBoolean` and so on) are still there but are useless.

`JSONSchemaNumeric` still works but is deprecated in favor of `JSONSchemaNumber` or `JSONSchemaInteger` (but again, just use `JSONSchema`).

### `xSubscribe()` methods

Auto-subscription methods were added for simplicity, but they were risky shortcuts because:
- potential errors are not managed,
- it can cause concurrency issues, especially given the average RxJS knowledge.

So `setItemSubscribe()`, `removeItemSubscribe()` and `clearSubscribe()` are deprecated: subscribe manually. Will be removed in v9.

### Prefix and collision

If you were using a prefix because you have multiple apps on the same subdomain, configuration has changed to allow interoperability.

Before v8:
```typescript
import { localStorageProviders, LOCAL_STORAGE_PREFIX } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({ prefix: 'myapp' }),
    // or
    { provide: LOCAL_STORAGE_PREFIX, useValue: 'myapp' },
  ]
})
export class AppModule {}
```

Since v8:
```typescript
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      LSPrefix: 'myapp_', // Note the underscore
      IDBDBName: 'myapp_ngStorage',
    }),
  ]
})
export class AppModule {}
```

**Be very careful while changing this in applications already deployed in production, as an error could mean the loss of all previously stored data.**

## More documentation

- [Full changelog for v8](../CHANGELOG.md)
- [Full validation guide](./VALIDATION.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
