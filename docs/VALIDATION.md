# Validation guide

## Why validation?

Any client-side storage (cookies, `localStorage`, `indexedDb`...) is not secure by nature,
as the client can forge the value (intentionally to attack your app, or unintentionally because it is affected by a virus or a XSS attack).

It can cause obvious **security issues**, but also **errors** and thus crashes (as the received data type may not be what you expected).

Then, **any data coming from client-side storage should be checked before used**.

It was allowed since v5 of the lib, and is **now required since v7** (see the [migration guide](./MIGRATION_TO_V7.md)).

## Why JSON schemas?

[JSON Schema](https://json-schema.org/) is a standard to describe the structure of a JSON data.
You can see this as an equivalent to the DTD in XML, the Doctype in HTML or interfaces in TypeScript.

It can have many uses (it's why you have autocompletion in some JSON files in Visual Studio Code).
**In this lib, JSON schemas are used to validate the data retrieved from local storage.**

## How to validate simple data

As a general recommendation, we recommend to keep your data structures as simple as possible,
as you'll see the more complex it is, the more complex is validation too.

### Boolean

```typescript
this.localStorage.getItem<boolean>('test', { schema: { type: 'boolean' } })
```

### Integer

```typescript
this.localStorage.getItem<number>('test', { schema: { type: 'integer' } })
```

### Number

```typescript
this.localStorage.getItem<number>('test', { schema: { type: 'number' } })
```

### String

```typescript
this.localStorage.getItem<string>('test', { schema: { type: 'string' } })
```

### Arrays

```typescript
this.localStorage.getItem<boolean[]>('test', { schema: {
  type: 'array',
  items: { type: 'boolean' }
} })
```

```typescript
this.localStorage.getItem<number[]>('test', { schema: {
  type: 'array',
  items: { type: 'integer' }
} })
```

```typescript
this.localStorage.getItem<number[]>('test', { schema: {
  type: 'array',
  items: { type: 'number' }
} })
```

```typescript
this.localStorage.getItem<string[]>('test', { schema: {
  type: 'array',
  items: { type: 'string' }
} })
```

What's expected in `items` is another JSON schema.

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

this.localStorage.getItem<User>('test', { schema })
```

What's expected for each property is another JSON schema.

## Why a schema *and* a cast?

You may ask why we have to define a TypeScript cast with `getItem<User>()` *and* a JSON schema with `{ schema }`.

It's because they happen at different steps:
- a cast (`getItem<User>()`) just says "TypeScript, trust me, I'm telling you it will be a `User`", but it only happens at *compilation* time (it won't be checked at runtime)
- the JSON schema (`{ schema }`) will be used at *runtime* when getting data in local storage for real.

So they each serve a different purpose:
- casting allow you to retrieve the data if the good type instead of `any`
- the schema allow the lib to validate the data at runtime

Be aware **you are responsible the casted type (`User`) describes the same structure as the JSON schema**.
The lib can't check that.

## How to validate fixed values

Temporarily, documentation for constants and enums is removed,
as there will be a breaking change in v8.

## Additional validation

Some types have additional validation options since version >= 6.

### Options for integers and numbers

- `multipleOf`
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`

For example:

```typescript
this.localStorage.getItem('test', { schema: {
  type: 'number',
  maximum: 5
} })
```

### Options for strings

- `maxLength`
- `minLength`
- `pattern`

For example:
```typescript
this.localStorage.getItem('test', { schema: {
  type: 'string',
  maxLength: 10
} })
```

### Options for arrays

- `maxItems`
- `minItems`
- `uniqueItems`

For example:
```typescript
this.localStorage.getItem('test', { schema: {
  type: 'array',
  items: { type: 'string' },
  maxItems: 5
} })
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

this.localStorage.getItem<User[]>('test', { schema })
```

## Errors vs. `null`

If validation fails, it'll go in the error callback:

```typescript
this.localStorage.getItem<string>('existing', { schema: { type: 'string' } })
.subscribe((result) => {
  // Called if data is valid or null
}, (error) => {
  // Called if data is invalid
});
```

But as usual (like when you do a database request), not finding an item is not an error. It succeeds but returns `null`.

```typescript
this.localStorage.getItem<string>('notExisting', { schema: { type: 'string' } })
.subscribe((result) => {
  result; // null
}, (error) => {
  // Not called
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

## ES6 shortcut

In EcmaScript >= 6, this:

```typescript
const schema: JSONSchemaBoolean = { type: 'boolean' };

this.localStorage.getItem<boolean>('test', { schema });
```

is a shortcut for this:
```typescript
const schema: JSONSchemaBoolean = { type: 'boolean' };

this.localStorage.getItem<boolean>('test', { schema: schema });
```

which works only if the property and the variable have the same name.
So if your variable has another name, you can't use the shortcut:
```typescript
const customSchema: JSONSchemaBoolean = { type: 'boolean' };

this.localStorage.getItem<boolean>('test', { schema: customSchema });
```

[Back to general documentation](../README.md)
