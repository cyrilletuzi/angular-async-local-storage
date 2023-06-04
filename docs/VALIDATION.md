# Validation guide

## Why validation?

Any client-side storage (cookies, `localStorage`, `indexedDb`...) is not secure by nature, as the client can forge the value (intentionally to attack your app, or unintentionally because it is affected by a virus or a XSS attack).

It can cause obvious **security issues**, but also **errors** and thus crashes (as the received data type may not be what you expected).

Then, **any data coming from client-side storage should be checked before used**.

## Why JSON schemas?

[JSON Schema](https://json-schema.org/) is a standard to describe the structure of a JSON data. You can see this as an equivalent to the DTD in XML, the Doctype in HTML or interfaces in TypeScript.

It can have many uses (it is why you have autocompletion in some JSON files in Visual Studio Code). **In this lib, JSON schemas are used to validate the data retrieved from client-side storage.**

## How to validate simple data

As a general recommendation, we recommend to keep your data structures as simple as possible, as you will see the more complex it is, the more complex is validation too.

### Boolean

```typescript
this.storage.get('test', { type: 'boolean' })
```

### Integer

```typescript
this.storage.get('test', { type: 'integer' })
```

### Number

```typescript
this.storage.get('test', { type: 'number' })
```

### String

```typescript
this.storage.get('test', { type: 'string' })
```

### Arrays of primitives

```typescript
this.storage.get('test', {
  type: 'array',
  items: { type: 'integer' },
})
```

```typescript
this.storage.get('test', {
  type: 'array',
  items: { type: 'number' },
})
```

```typescript
this.storage.get('test', {
  type: 'array',
  items: { type: 'string' },
})
```

### How to validate advanced data

## typebox

There is 2 ways to define the JSON schemas:
- directly as in the previous examples
- with the [`@sinclair/typebox` library](https://github.com/sinclairzx81/typebox)

`typebox` is recommended for advanced cases, but it requires the installation of an additional library:

```bash
npm install @sinclair/typebox
```

Note you will get a warning from Angular CLI when building because the npm version of `@sinclair/typebox` is serving CommonJS instead of ESM, but the impact on bundle size would be similar in ESM for this library.

## Tuple

In most cases, an array is for a list with values of the *same type*. In special cases, it can be useful to use arrays with values of different types. It is called tuples in TypeScript. For example: `['test', 1]`

```typescript
// JSON schema
this.storage.get<[string, number]>('test', {
  type: 'array',
  items: [
    { type: 'string' },
    { type: 'number' },
  ],
})

// typebox
import { Static, Type } from '@sinclair/typebox';

const schema = Type.Tuple([
  Type.String(),
  Type.Number(),
]);

this.storage.get<Static<typeof schema>>('test', schema)
```

Note a tuple has a fixed length: the number of values in the array and the number of schemas provided in `items` must be exactly the same, otherwise the validation fails.

## How to validate objects

For example:
```typescript
// JSON schema
import { JSONSchema } from '@ngx-pwa/local-storage';

interface User {
  name: string;
  isAuthenticated: boolean;
  age?: number;
  favoriteColors: string[];
}

const schema: JSONSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    isAuthenticated: { type: 'boolean' },
    age: { type: 'number' },
    favoriteColors: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['name', 'isAuthenticated', 'favoriteColors']
};

this.storage.get<User>('test', schema)

// typebox
import { Static, Type } from '@sinclair/typebox';

const schema = Type.Object({
  name: Type.String(),
  isAuthenticated: Type.Boolean(),
  age: Type.Optional(Type.Number()),
  favoriteColors: Type.Array(Type.String()),
});

this.storage.get<Static<typeof schema>>('test', schema)
```

### Special objects

For special structures like `Map`, `Set` or `Blob`, see the [serialization guide](./SERIALIZATION.md).

### Why a schema *and* a cast?

You may ask why we have to define a TypeScript cast with `get<User>()` *and* a JSON schema with `schema`.

It is because they happen at different steps:
- a cast (`get<User>()`) just says "TypeScript, trust me, I am telling you it will be a `User`", but it only happens at *compilation* time, and given it is client-side storage (reminder: it can be forged), **it is not true you known it will be a `User`**.
- the JSON schema (`schema`) will be used at *runtime* when getting data in client-side storage for real.

So they each serve a different purpose:
- casting allows you to retrieve the data with the good type instead of `any`
- the schema allows the lib to validate the data at runtime

For now, the library is able to infer the return type based on the JSON schema for primitives (`string`, `number`, `integer`, `boolean` and `array` of these), but not for more complex structures like objects.

Be aware **you are responsible the casted type (`User`) describes the same structure as the JSON schema**.
For the same reason, the lib cannot check that. This is where the `typebox` solution shines: it ensures the match between the JSON Schema and the TypeScript type without having to write the code twice.

## Validation when writing

While validation is only required when *reading* storage, when the data is complex, you could store a wrongly structured object by error without noticing, and then `get()` will fail.

So when storing complex objects, it is better to check the structure when writing too:

```typescript
this.storage.set('test', user, schema)
```

You can also do this check only in development:

```typescript
import { isDevMode } from '@angular/core';

this.storage.set('test', user, isDevMode() ? schema : undefined)
```

## Additional validation

### Options for booleans

- `const` (not available with `typebox`)

### Options for integers and numbers

- `const` (not available with `typebox`)
- `enum` (not available with `typebox`)
- `multipleOf`
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`

For example:
```typescript
this.storage.get('test', {
  type: 'number',
  maximum: 5
})
```

### Options for strings

- `const` (not available with `typebox`)
- `enum` (not available with `typebox`)
- `maxLength`
- `minLength`
- `pattern`

For example:
```typescript
this.storage.get('test', {
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
this.storage.get('test', {
  type: 'array',
  items: { type: 'string' },
  maxItems: 5
})
```

## Errors vs. `undefined` / `null`

If validation fails, it will go in the error callback:

```typescript
this.storage.get('existing', { type: 'string' })
.subscribe({
  next: (result) => { /* Called if data is valid or null or undefined */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

But as usual (like when you do a database request), not finding an item is not an error. It succeeds but returns `undefined`:
```typescript
this.storage.get('notExisting', { type: 'string' })
.subscribe({
  next: (result) => { result; /* undefined */ },
  error: (error) => { /* Not called */ },
});
```

## Differences from the standard

The role of the validation feature in this lib is to check the data against corruption, so it needs to be a strict checking. Then there are important differences with the JSON schema standards.

### Restrictions

Types are enforced: each value MUST have a `type`.

### Unsupported features

The following features available in the JSON schema standard are *not* available in this lib:
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

## Custom validation

Validating via this lib is recommended but not required. You can use all the native JavaScript operators and functions to validate by yourself. For example:

```typescript
this.storage.get('test').subscribe((result) => {

  result; // type: unknown

  if (typeof result === 'string') {
    result; // type: string
    result.substr(0, 2); // OK
  }

});
```

**TypeScript will narrow the data type as you validate**.

[Back to general documentation](../README.md)
