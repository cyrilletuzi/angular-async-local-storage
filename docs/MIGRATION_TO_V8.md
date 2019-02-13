# Migration guide to version 8

## Foreword

Just a word to state the decision to make the following breaking changes was beyond my control.
It follows a regression in TypeScript 3.2 (see [#64](https://github.com/cyrilletuzi/angular-async-local-storage/issues/64)).

The worst part was the TS team support: the regression would be solved only in TypeScript 3.4.
As a consequence, decision was made to refactor `JSONSchema` to not be dependent on unreliable edgy TypeScript behavior anymore.

The good part: the changes also allowed a lot of simplications for you. :)

## Previous migrations

If you were using previous versions and skipped v6, do [the migration guide to version 6](./MIGRATION_TO_V6.md) first.

[Migration to version 7](./MIGRATION_TO_V7.md) is not required,
as it is replaced by the new and easier validation syntax explained below,
but be aware that since v7, **validation is now required in `getItem()`**.
A full [validation guide](./VALIDATION.md) is available.

## How to migrate?

1. Update the lib:
```
npm install @ngx-pwa/local-storage@next
```

2. Start your project: problems will be seen at compilation.
Or you could search for `getItem` as most breaking changes are about its options.

## The bad part: breaking changes

**The following changes may require action from you**.

The main change is to add `type` to all your JSON schemas.

### New `indexedDB` store

To allow interoperability, the internal `indexedDB` storing system has changed.
It is not a breaking change as the lib do it in a backward-compatible way:
- when `indexedDB` storage is empty (new app users or data swiped), the new storage is used,
- when `indexedDB` old storage is here, the lib stays on this one.

So it should not concern you, but as it is very sensitive change, we recommend
**to test previously stored data is not lost before deploying in production**.

It's internal stuff, but it also means there is a transition phase where some of the users of your app
will be on the new storage, and others will be on the old one.

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

Also, `items` no longer accepts an array of JSON schemas, meaning arrays with multiple types
are no longer possible (and it's better for consistency, use an object if you mix types in a list).

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

`const` is now an option in `JSONSchema` (for `type`: `string`, `number`, `integer` or `boolean`),
meaning you must add the `type`.

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

`enum` is now an option in `JSONSchema` (for `type`: `string`, `number` or `integer`),
meaning you must add the `type`.

Before v8:
```typescript
this.localStorage.getItem('test', { schema: { enum: ['value 1', 'value 2'] } })
```

Since v8:
```typescript
this.localStorage.getItem('test', { type: 'string', enum: ['value 1', 'value 2'] })
```

It also means enums of different types are no longer possible (and it's better for consistency).

Also, `JSONSchemaEnum` interface is removed.

### Additional properties in schemas

The `schema` option of `getItem()` now only accepts our own `JSONSchema` interface,
which is a subset of the JSON Schema standard.

This lib has always discarded some features of the standard, as it uses the schemas for a specific purpose (validation).
But before v8, extra properties in the schema were accepted even if not supported. It is no longer possible since v8.

While not recommended, you can still force it:
```typescript
this.localStorage.getItem('test', schema as any)
```

### Prefix and collision

If you were using a prefix because you have multiple apps on the same subdomain,
configuration has changed to allow interoperability.
The old one still works for now but is deprecated and will be removed in v9.

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
import { localStorageProviders } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({
      LSPrefix: 'myapp_', // Note the underscore
      IDBDBName: 'myapp_ngStorage',
    }),
  ]
})
export class AppModule {}
```

**Be very careful while changing this, as an error could mean the loss of all previously stored data.**

## The good part: simplication changes

The following changes are not required but recommended.
**Previous code will still work** for now, but *for new code, follow these new guidelines*.

### Easier API for `getItem()`

`getItem()` API has been simplified: the secong argument is now directly the schema for validation.

Before v8:
```typescript
this.localStorage.getItem<string>('test', { schema: { type: 'string' } })
```

Since v8:
```typescript
this.localStorage.getItem('test', { type: 'string' })
```

The previous API may be removed in v9. So this change is strongly recommended, but you have time.

### Cast now inferred!

The previous change allows that the returned type of `getItem()` is now inferred for basic types (`string`, `number`, `boolean`)
and arrays of basic types (`string[]`, `number[]`, `boolean[]`).

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
this.localStorage.getItem('test', { type: 'string' }).subscribe((data) => {
  data; // string :D
});
```

Cast is still needed for objects. Follow the new [validation guide](./VALIDATION.md).

### Use the generic `JSONSchema`

Now the `JSONSchema` interface has been refactored, just use this one.
IntelliSense will adjust itself based on the `type` option.
The specific interfaces (`JSONSchemaString`, `JSONSchemaBoolean` and so on) are still there but are useless.

`JSONSchemaNumeric` still works but is deprecated in favor of `JSONSchemaNumber` or `JSONSchemaInteger`
(but again, just use `JSONSchema`). Will be removed in v9.

Also, `JSONSchemaNull` is removed (it was useless, as if the data is `null`, validation doesn't occur).

## More documentation

- [Full changelog for v8](../CHANGELOG.md)
- [Full validation guide](./VALIDATION.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
