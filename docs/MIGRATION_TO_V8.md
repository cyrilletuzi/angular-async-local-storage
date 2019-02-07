# Migration guide to version 8

## Foreword

Just a word to state the decision to make the following breaking changes was beyond my control.
It follows a regression in TypeScript 3.2 (see [#64](https://github.com/cyrilletuzi/angular-async-local-storage/issues/64)).

The worst part was the TS team support: the regression would be solved only in TypeScript 3.4.
As a consequence, decision was made to refactor `JSONSchema` to not be dependent on unreliable edgy TypeScript behavior anymore.

The good part: the changes also allowed some simplications for you. :)

## Previous migrations

If you were using previous versions and skipped v6 or v7, you may need to start by:
- [the migration guide to version 6](./MIGRATION_TO_V6.md),
- [the migration guide to version 7](./MIGRATION_TO_V7.md).

## How to migrate?

1. Update the lib:
```
npm install @ngx-pwa/local-storage@next
```

2. Start your project: problems will be seen at compilation.
Or you could search for `getItem` as most breaking changes are about its options.

## The bad part: breaking changes

**The following changes may require action from you**.

### `null` and `undefined`

Users with TypeScript `--strictNullChecks` option can't no longer use `null` or `undefined` as a value in `setItem()` and `setItemSubscribe()`. Who would do that anyway?

Also, `JSONSchemaNull` is removed.

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

## Additional properties in schemas

The `schema` option of `getItem()` now only accepts our own `JSONSchema` interface,
which is a subset of the JSON Schema standard.

This lib has always discarded some features of the standard, as it uses the schemas for a specific purpose (validation).
But before v8, extra properties in the schema were accepted even if not supported. It is no longer possible since v8.

While not recommended, you can still force it:
```typescript
this.localStorage.getItem('test', { schema: someSchema as any })
```

## The good part: simplication changes

The following changes are not required but strongly recommended.
**Previous code will still work**, but *for new code, follow these new guidelines*.

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
The specific interfaces (`JSONSchemaString`, `JSONSchemaBoolean` and so on) are still there but useless.

`JSONSchemaNumeric` still works but is deprecated in favor of `JSONSchemaNumber` or `JSONSchemaInteger`
(but again, just use `JSONSchema`).

## More documentation

- [Full changelog for v8](../CHANGELOG.md)
- [Full validation guide](./VALIDATION.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
