# Validation guide

[JSON Schema](https://json-schema.org/) is a standard to describe the structure of a JSON data.
You can see this as an equivalent to the DTD in XML, the Doctype in HTML or interfaces in TypeScript.

It can have many uses (it's why you have autocompletion in some JSON files in Visual Studio Code).
In this lib, JSON schemas are used to validate the data retrieved from local storage.
You can learn why it's important in the [migration guide to v7](./MIGRATION_TO_V7.md), as it is indeed required since version 7 of the lib.

The JSON schema standard has its own [documentation](https://json-schema.org/),
and you can also follow the `JSONSchema` interface exported by the lib:

```typescript
import { JSONSchema } from '@ngw-pwa/local-storage';

const schema = { type: 'string' };
```

But as a convenience, we'll show here how to validate the common scenarios.

## How to validate?

### Validating a boolean

```typescript
this.localStorage.getItem<boolean>('test', { schema: { type: 'boolean' } })
```

### Validating a number

For a number:
```typescript
this.localStorage.getItem<number>('test', { schema: { type: 'number' } })
```

For an integer only:
```typescript
this.localStorage.getItem<number>('test', { schema: { type: 'integer' } })
```

For numbers and integers, in version >= 6, you can also add the following optional validations:
- `multipleOf`
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`

### Validating a string

```typescript
this.localStorage.getItem<string>('test', { schema: { type: 'string' } })
```

For strings, in version >= 6, you can also add the following optional validations:
- `maxLength`
- `minLength`
- `pattern`

### Validating an array

```typescript
this.localStorage.getItem<string[]>('test', { schema: { items: { type: 'string' } } })
```

What's expected in `items` is another JSON schema,
so you can also add the other optional validations related to the chosen type.

For arrays, in version >= 6, you can also add the following optional validations:
- `maxItems`
- `minItems`
- `uniqueItems`

### Validating an object

```typescript
interface User {
  firstName: string;
  lastName: string;
  age?: number;
}

this.localStorage.getItem<User>('test', { schema: {
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['firstName', 'lastName']
} })
```

What's expected for each property is another JSON schema,
so you can also add the other optional validations related to the chosen type.

### Validating fixed values

Since version >= 6, if it can only be a fixed value:
```typescript
this.localStorage.getItem<string>('test', { schema: { const: 'some value' } })
```

Since version >= 6, if it can only be a fixed value among a list:
```typescript
this.localStorage.getItem<string>('test', { schema: { enum: ['value 1', 'value 2'] } })
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
so it needs to be a stric checking. Then there are important differences with the JSON schema standards.

### Restrictions

Types are enforced: each value MUST have either `type` or `properties` or `items` or `const` or `enum`.

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

## Why a schema AND a cast?

You may ask why we have to define a TypeScript cast with `getItem<string>()` AND a JSON schema with `{ schema: { type: 'string' } }`.

It's because a cast only means: "TypeScript, trust me, I'm telling you it will be a string".
But TypeScript won't do any real validation as it can't:
**TypeScript can only manage checks at compilation time, while client-side storage checks can only happen at runtime**.
So the JSON schema is required for real validation.

And in the opposite way, the JSON schema doesn't tell TypeScript what will be the type of the data.
So the cast is a convenience so you don't end up with `any` while you already checked the data.

It means **you are responsible the casted type describes the same structure as the JSON schema**.
The lib can't check that.

[Back to general documentation](../README.md)
