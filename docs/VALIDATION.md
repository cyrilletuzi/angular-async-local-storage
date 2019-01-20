# Validation guide

## Guide for version >= 7.5

Version 7.5+ of this lib greatly simplified validation (we recommend to update).

This is the up to date guide. For validation in older versions, see [the old validation guide](./VALIDATION_BEFORE_V7.5.md).

## Why validation?

Any client-side storage (cookies, `localStorage`, `indexedDb`...) is not secure by nature,
as the client can forge the value (intentionally to attack your app, or unintentionally because it is affected by a virus or a XSS attack).

It can cause obvious **security issues**, but also **errors** and thus crashes (as the received data type may not be what you expected).

Then, **any data coming from client-side storage should be checked before used**.

## Why JSON schemas?

[JSON Schema](https://json-schema.org/) is a standard to describe the structure of a JSON data.
You can see this as an equivalent to the DTD in XML, the Doctype in HTML or interfaces in TypeScript.

It can have many uses (it's why you have autocompletion in some JSON files in Visual Studio Code).
**In this lib, JSON schemas are used to validate the data retrieved from local storage.**

The JSON schema standard has its own [documentation](https://json-schema.org/),
and you can also follow the `JSONSchema` interfaces exported by the lib. But as a convenience, we'll show here how to validate the common scenarios.

## How to validate simple data

As a general recommendation, we recommend to keep your data structures as simple as possible,
as you'll see the more complex it is, the more complex is validation too.

### Shortcut for a boolean

```typescript
import { SCHEMA_BOOLEAN } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_BOOLEAN })
```

### Shortcut for an integer

```typescript
import { SCHEMA_INTEGER } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_INTEGER })
```

### Shortcut for a number

```typescript
import { SCHEMA_NUMBER } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_NUMBER })
```

### Shortcut for a string

```typescript
import { SCHEMA_STRING } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_STRING })
```

### Shortcuts for arrays

```typescript
import { SCHEMA_ARRAY_OF_BOOLEANS } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_ARRAY_OF_BOOLEANS })
```

```typescript
import { SCHEMA_ARRAY_OF_INTEGERS } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_ARRAY_OF_INTEGERS })
```

```typescript
import { SCHEMA_ARRAY_OF_NUMBERS } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_ARRAY_OF_NUMBERS })
```

```typescript
import { SCHEMA_ARRAY_OF_STRINGS } from '@ngx-pwa/local-storage';

this.localStorage.getItem('test', { schema: SCHEMA_ARRAY_OF_STRINGS })
```

## How to validate objects

As the properties of an object are dynamic (it can be anything),
validating an object requires more work:
- a full JSON schema must be used,
- a cast must be added (otherwise the result will be of type `any`).

For example:
```typescript
import { JSONSchemaObject, SCHEMA_NUMBER, SCHEMA_STRING } from '@ngx-pwa/local-storage';

interface User {
  firstName: string;
  lastName: string;
  age?: number;
}

const schema: JSONSchemaObject = {
  properties: {
    firstName: SCHEMA_STRING,
    lastName: SCHEMA_STRING,
    age: SCHEMA_NUMBER
  },
  required: ['firstName', 'lastName']
};

this.localStorage.getItem<User>('test', { schema })
```

What's expected for each property is another JSON schema,
so you can also add the other optional validations related to the chosen type.

### Why a schema *and* a cast?

You may ask why we have to define a TypeScript cast with `getItem<User>()` *and* a JSON schema with `{ schema }`.

It's because they happen at different steps:
- a cast (`getItem<User>()`) just says "TypeScript, trust me, I'm telling you it will be a `User`", but it only happens at *compilation* time (it won't be checked at runtime)
- the JSON schema (`{ schema }`) will be used at *runtime* when getting data in local storage for real.

For previous structures, which are static, we can infer the final result type based on the JSON schema.
But as in an object properties are dynamic (we can't now in advance what properties names and types there will be),
automatic inference is not possible here.

Be aware **you are responsible the casted type (`User`) describes the same structure as the JSON schema**.
The lib can't check that.

## How to validate fixed values

### Const

```typescript
import { JSONSchemaConstOf } from '@ngx-pwa/local-storage';

const schema: JSONSchemaConstOf<string> = { const: 'some value' };

this.localStorage.getItem('test', { schema })
```

Parameter type for `JSONSchemaConstOf` can be `string` or `number`.

### Enum

```typescript
import { JSONSchemaEnumOf } from '@ngx-pwa/local-storage';

const schema: JSONSchemaEnumOf<string> = { enum: ['value 1', 'value 2'] };

this.localStorage.getItem('test', { schema })
```

Parameter type for `JSONSchemaEnumOf` can be `string` or `number` or `boolean`.

## Additional validation

Some types have additional validation options. A full JSON schema must be used for those.

### Options for integers and numbers

- `multipleOf`
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`

For example:

```typescript
import { JSONSchemaNumeric } from '@ngx-pwa/local-storage';

const schema: JSONSchemaNumeric = {
  type: 'number',
  maximum: 5
};

this.localStorage.getItem('test', { schema })
```

### Options for strings

- `maxLength`
- `minLength`
- `pattern`

For example:
```typescript
import { JSONSchemaString } from '@ngx-pwa/local-storage';

const schema: JSONSchemaString = {
  type: 'string',
  maxLength: 10
};

this.localStorage.getItem('test', { schema })
```

### Options for arrays

- `maxItems`
- `minItems`
- `uniqueItems`

For example:
```typescript
import { JSONSchemaArrayOf, JSONSchemaString, SCHEMA_STRING } from '@ngx-pwa/local-storage';

const schema: JSONSchemaArrayOf<JSONSchemaString> = {
  items: SCHEMA_STRING,
  maxItems: 5
};

this.localStorage.getItem('test', { schema })
```

What's expected in `items` is another JSON schema,
so you can also add the other optional validations related to the chosen type.

## How to validate nested types

Due to a limitation of TypeScript, when nesting array, objects or advanced types,
you'll need to cast subschemas:

```typescript
import { JSONSchemaArray, JSONSchemaObject, JSONSchemaString, SCHEMA_STRING } from '@ngx-pwa/local-storage';

interface User {
  firstName: string;
  lastName: string;
}

const schema: JSONSchemaArray = {
  items: {
    properties: {
      firstName: {
        type: 'string',
        maxLength: 10
      } as JSONSchemaString,
      lastName: SCHEMA_STRING
    },
    required: ['firstName', 'lastName']
  } as JSONSchemaObject
};

this.localStorage.getItem<User[]>('test', { schema })
```

## Errors vs. `null`

If validation fails, it'll go in the error callback:

```typescript
this.localStorage.getItem('existing', { schema: SCHEMA_STRING })
.subscribe((result) => {
  // Called if data is valid or null
}, (error) => {
  // Called if data is invalid
});
```

But as usual (like when you do a database request), not finding an item is not an error. It succeeds but returns `null`.

```typescript
this.localStorage.getItem('notExisting', { schema: SCHEMA_STRING })
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
