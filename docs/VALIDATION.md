# Validation guide

## Version

**This is the up to date guide about validation for versions >= 8 of this lib.**
The old guide for validation in versions < 8 is available [here](./VALIDATION_BEFORE_V8.md),
but is not recommended as there was breaking changes in v8.

## Examples

The examples will use the new `StorageMap` service.
But everything in this guide can be done in the same way with the `LocalStorage` service:
- `this.storageMap.get()` is the same as `this.localStorage.getItem()`
- `this.storageMap.set()` is the same as `this.localStorage.setItem()`
- `this.storageMap.delete()` is the same as `this.localStorage.removeItem()`
- `this.storageMap.clear()` is the same as `this.localStorage.clear()`

## Why validation?

Any client-side storage (cookies, `localStorage`, `indexedDb`...) is not secure by nature,
as the client can forge the value (intentionally to attack your app, or unintentionally because it is affected by a virus or a XSS attack).

It can cause obvious **security issues**, but also **errors** and thus crashes (as the received data type may not be what you expected).

Then, **any data coming from client-side storage should be checked before used**.

## Why JSON schemas?

[JSON Schema](https://json-schema.org/) is a standard to describe the structure of a JSON data.
You can see this as an equivalent to the DTD in XML, the Doctype in HTML or interfaces in TypeScript.

It can have many uses (it's why you have autocompletion in some JSON files in Visual Studio Code).
**In this lib, JSON schemas are used to validate the data retrieved from client-side storage.**

## How to validate simple data

As a general recommendation, we recommend to keep your data structures as simple as possible,
as you'll see the more complex it is, the more complex is validation too.

### Boolean

```typescript
this.storageMap.get('test', { type: 'boolean' })
```

### Integer

```typescript
this.storageMap.get('test', { type: 'integer' })
```

### Number

```typescript
this.storageMap.get('test', { type: 'number' })
```

### String

```typescript
this.storageMap.get('test', { type: 'string' })
```

### Arrays

```typescript
this.storageMap.get('test', {
  type: 'array',
  items: { type: 'boolean' },
})
```

```typescript
this.storageMap.get('test', {
  type: 'array',
  items: { type: 'integer' },
})
```

```typescript
this.storageMap.get('test', {
  type: 'array',
  items: { type: 'number' },
})
```

```typescript
this.storageMap.get('test', {
  type: 'array',
  items: { type: 'string' },
})
```

What's expected in `items` is another JSON schema.

## Tuples

In most cases, an array is for a list with values of the *same type*.
In special cases, it can be useful to use arrays with values of different types.
It's called tuples in TypeScript. For example: `['test', 1]`

```typescript
this.storageMap.get('test', {
  type: 'array',
  items: [
    { type: 'string' },
    { type: 'number' },
  ],
})
```

Note a tuple has a fixed length: the number of values in the array and the number of schemas provided in `items`
must be exactly the same, otherwise the validation fails.

## How to validate objects

For example:
```typescript
import { JSONSchema } from '@ngx-pwa/local-storage';

interface User {
  firstName: string;
  lastName: string;
  age?: number;
}

const schema: JSONSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    age: { type: 'number' },
  },
  required: ['firstName', 'lastName']
};

this.storageMap.get<User>('test', schema)
```

What's expected for each property is another JSON schema.

### Special objects

For special structures like `Map`, `Set` or `Blob`,
see the [serialization guide](./SERIALIZATION.md).

### Why a schema *and* a cast?

You may ask why we have to define a TypeScript cast with `get<User>()` *and* a JSON schema with `schema`.

It's because they happen at different steps:
- a cast (`get<User>()`) just says "TypeScript, trust me, I'm telling you it will be a `User`", but it only happens at *compilation* time (it won't be checked at runtime)
- the JSON schema (`schema`) will be used at *runtime* when getting data in local storage for real.

So they each serve a different purpose:
- casting allows you to retrieve the data with the good type instead of `any`
- the schema allows the lib to validate the data at runtime

For previous basic types, as they are static, we can infer automatically.
But as objects properties are dynamic, we can't do the same for objects.

Be aware **you are responsible the casted type (`User`) describes the same structure as the JSON schema**.
The lib can't check that.

## Additional validation

### Options for booleans

- `const`

### Options for integers and numbers

- `const`
- `enum`
- `multipleOf`
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`

For example:
```typescript
this.storageMap.get('test', {
  type: 'number',
  maximum: 5
})
```

### Options for strings

- `const`
- `enum`
- `maxLength`
- `minLength`
- `pattern`

For example:
```typescript
this.storageMap.get('test', {
  type: 'string',
  maxLength: 10
})
```

### Options for arrays

- `maxItems`
- `minItems`
- `uniqueItems`

For example:
```typescript
this.storageMap.get('test', {
  type: 'array',
  items: { type: 'string' },
  maxItems: 5
})
```

## How to validate nested types

```typescript
import { JSONSchema } from '@ngx-pwa/local-storage';

interface User {
  firstName: string;
  lastName: string;
}

const schema: JSONSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        maxLength: 10
      },
      lastName: { type: 'string' }
    },
    required: ['firstName', 'lastName']
  }
};

this.storageMap.get<User[]>('test', schema)
```

## Errors vs. `undefined` / `null`

If validation fails, it'll go in the error callback:

```typescript
this.storageMap.get('existing', { type: 'string' })
.subscribe({
  next: (result) => { /* Called if data is valid or null or undefined */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

But as usual (like when you do a database request), not finding an item is not an error.
It succeeds but returns:

- `undefined` with `StorageMap`
```typescript
this.storageMap.get('notExisting', { type: 'string' })
.subscribe({
  next: (result) => { result; /* undefined */ },
  error: (error) => { /* Not called */ },
});
```

- `null` with `LocalStorage`
```typescript
this.localStorage.getItem('notExisting', { type: 'string' })
.subscribe({
  next: (result) => { result; /* null */ },
  error: (error) => { /* Not called */ },
});
```

## Differences from the standard

The role of the validation feature in this lib is to check the data against corruption,
so it needs to be a strict checking. Then there are important differences with the JSON schema standards.

### Restrictions

Types are enforced: each value MUST have a `type`.

### Unsupported features

The following features available in the JSON schema standard
are *not* available in this lib:
- `additionalItems`
- `additionalProperties`
- `propertyNames`
- `maxProperties`
- `minProperties`
- `patternProperties`
- `not`
- `contains`
- `allOf`
- `anyOf`
- `oneOf`
- array for `type`

[Back to general documentation](../README.md)
