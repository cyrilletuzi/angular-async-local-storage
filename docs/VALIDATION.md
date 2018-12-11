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

The JSON schema standard has its own [documentation](https://json-schema.org/),
and you can also follow the `JSONSchema` interfaces exported by the lib. But as a convenience, we'll show here how to validate the common scenarios.

## How to validate?

### Validating a boolean

```typescript
import { JSONSchemaBoolean } from '@ngx-pwa/local-storage';

const schema: JSONSchemaBoolean = { type: 'boolean' };

this.localStorage.getItem<boolean>('test', { schema })
```

### Validating a number

For a number:
```typescript
import { JSONSchemaNumeric } from '@ngx-pwa/local-storage';

const schema: JSONSchemaNumeric = { type: 'number' };

this.localStorage.getItem<number>('test', { schema })
```

For an integer only:
```typescript
import { JSONSchemaNumeric } from '@ngx-pwa/local-storage';

const schema: JSONSchemaNumeric = { type: 'integer' };

this.localStorage.getItem<number>('test', { schema })
```

For numbers and integers, in version >= 6, you can also add the following optional validations:
- `multipleOf`
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`

### Validating a string

```typescript
import { JSONSchemaString } from '@ngx-pwa/local-storage';

const schema: JSONSchemaString = { type: 'string' };

this.localStorage.getItem<string>('test', { schema })
```

For strings, in version >= 6, you can also add the following optional validations:
- `maxLength`
- `minLength`
- `pattern`

### Validating an array

```typescript
import { JSONSchemaArray, JSONSchemaString } from '@ngx-pwa/local-storage';

const schema: JSONSchemaArray = { items: { type: 'string' } as JSONSchemaString };

this.localStorage.getItem<string[]>('test', { schema })
```

What's expected in `items` is another JSON schema,
so you can also add the other optional validations related to the chosen type.

For arrays, in version >= 6, you can also add the following optional validations:
- `maxItems`
- `minItems`
- `uniqueItems`

### Validating an object

```typescript
import { JSONSchemaObject, JSONSchemaString, JSONSchemaNumeric } from '@ngx-pwa/local-storage';

interface User {
  firstName: string;
  lastName: string;
  age?: number;
}

const schema: JSONSchemaObject = {
  properties: {
    firstName: { type: 'string' } as JSONSchemaString,
    lastName: { type: 'string' } as JSONSchemaString,
    age: { type: 'number' } as JSONSchemaNumeric
  },
  required: ['firstName', 'lastName']
};

this.localStorage.getItem<User>('test', { schema })
```

What's expected for each property is another JSON schema,
so you can also add the other optional validations related to the chosen type.

### Validating fixed values

Since version >= 6, if it can only be a fixed value:
```typescript
import { JSONSchemaConst } from '@ngx-pwa/local-storage';

const schema: JSONSchemaConst = { const: 'some value' };

this.localStorage.getItem<string>('test', { schema })
```

Since version >= 6, if it can only be a fixed value among a list:
```typescript
import { JSONSchemaEnum } from '@ngx-pwa/local-storage';

const schema: JSONSchemaEnum = { enum: ['value 1', 'value 2'] };

this.localStorage.getItem<string>('test', { schema })
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

## Why specific JSONSchema interfaces?

Unfortunately, the JSON schema standard is structured in such a way it's currently impossible to do an equivalent TypeScript interface,
which would be generic for all types, but only allowing you the optional validations relative to the type you choose
(for example, `maxLength` should only be allowed when `type` is set to `'string'`).

Thus casting with a more specific interface (like `JSONSchemaString`) allows TypeScript to check your JSON Schema is really valid.
But it's not mandatory.

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
