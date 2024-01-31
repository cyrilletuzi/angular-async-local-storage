# Migration guide to version 7

The migration guide to v7 is quite long as it explains the issue in details, so you understand exactly what you are doing. But relax, **the real actions required are not so long and are *for your own good***.

## LTS support ended

[Angular version 7 is officially outdated](https://angular.io/guide/releases).

## WARNING

Version 7 of this library tried to take a huge step forward by enforcing validation, for security and error management. Unfortunately, unforeseen issues happened, some very bad as they were beyond our control
(like [#64](https://github.com/cyrilletuzi/angular-async-local-storage/issues/64)).

Version 8 achieves the goal we tried in v7 the right way. Everything has been cleaned and things are a lot easier for you.

Then, **v7 is deprecated**. For Angular 7, it is recommended to:
- stay on v6 of the lib,
- or upgrade to Angular 8 and use v8 of the library (see the [v8 migration guide](./MIGRATION_TO_V8.md).

## Previous migrations

If you were using v4 or v5 and skipped v6, you first need to follow [the migration guide to version 6](./MIGRATION_TO_V6.md).

## Why required validation?

Any client-side storage (cookies, `localStorage`, `indexedDb`...) is not secure by nature, as the client can forge the value (intentionally to attack your app, or unintentionally because it is affected by a virus or a XSS attack).

It can cause obvious **security issues**, but also **errors** and thus crashes (as the received data type may not be what you expected).

Then, **any data coming from client-side storage should be checked before used**, as mentionned in the [README](../README.md).

That is why v5 of this library introduced a new option for `getItem()` to validate the data against a JSON schema. But until now it was optional (to not break with previous versions and to let you use your own validation system), which is bad.

It is now time to make **validation mandatory**, as it is now possible with the new type `unknown` in TypeScript >= 3, supported by Angular >= 7.

## What does it mean?

- No change for users already doing a validation via the JSON schema option of the lib:

```typescript
// Before and after v7:
this.localStorage.getItem<string>('test', { schema: { type: 'string' } })
.subscribe((result) => {
  result; // type: string
  result.substr(0, 2); // OK
});
```

- `getItem()` calls with no schema option now return `unknown` (instead of `any`), forcing you to validate the data. For example:

```typescript
// Before v7:
this.localStorage.getItem('test').subscribe((result) => {
  result; // type: any
  result.substr(0, 2); // Bad but compilation OK
});

// With v7:
this.localStorage.getItem('test').subscribe((result) => {

  result; // type: unknown
  result.substr(0, 2); // Compilation error

  if (typeof result === 'string') {
    result; // type: string
    result.substr(0, 2); // OK
  }

});
```

## What about casting?

You may ask if it is OK if you were casting your data like this:

```typescript
this.localStorage.getItem<string>('test').subscribe((result) => {
  result; // type: string
});
```

It is only a convenience allowed by the library. It is useful when you are already validating the data with a JSON schema, to cast the data type.

But **when you were not validating the data, it was really bad**. Casting like this only means: "TypeScript, trust me, I am telling you it will be a string". But TypeScript will *not* do any real validation as it cannot: **TypeScript can only manage checks at compilation time, while client-side storage checks can only happen at runtime**.

So you ended up with a `string` type while the real data may not be a `string` at all, leading to security issues and errors.

## How to validate?

If you were not already validating your data, there are several options.

### Solution 1: JSON schema validation with v8 (recommended)

Version 8 of the library greatly simplifies validation. So if you are not yet on v7, we strongly recommend you to to [upgrade to v8 directly](./MIGRATION_TO_V8.md), and to follow the [new validation guide](./VALIDATION.md) instead.

### Solution 2: custom validation (very painful)

You can use all the native JavaScript operators and functions to validate. For example:

```typescript
this.localStorage.getItem('test').subscribe((result) => {

  result; // type: unknown

  if (typeof result === 'string') {
    result; // type: string
    result.substr(0, 2); // OK
  }

});
```

**TypeScript will narrow the data type as you validate**.

You can also use any other library to validate your data. But in this case, TypeScript will not be able to narrow the data type automatically. You can help TypeScript like this:

```typescript
import { isString } from 'some-library';

this.localStorage.getItem('test').subscribe((unsafeResult) => {

  if (isString(unsafeResult)) {

    unsafeResult; // type: still unknown

    const result = unsafeResult as string;
    result; // type: string
    result.substr(0, 2); // OK

  }

});
```

## More documentation

- [Full changelog for v7](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
