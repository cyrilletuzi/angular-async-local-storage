# Migration guide to version 7

The migration guide to v7 is quite long as it explains the issue in details,
so you understand exactly what you are doing. But relax,
**the real actions required are not so long and are *for your own good***.

## WARNING

Version 7 of this library tried to take a huge step forward by forcing validation, for security and error management.
Unfortunately, unforeseen issues happened, some very bad as they are beyond our control
(like [#64](https://github.com/cyrilletuzi/angular-async-local-storage/issues/64)).

Version 8 will achieve the goal we tried in v7 the right way. Everything will be clean and a lot easier for you.

Then, **we actually recommend to *not* upgrade to v7 and to wait for v8**,
to avoid a double painful migration. v8 will be released at the same time as Angular 8, ie. in May 2019.

**Version 6 of the library is compatible with Angular 7.** Bug fixes that happened during v7 have all been backported to v6.

You can install it with:
```bash
npm install @ngx-pwa/local-storage@6
```

## Previous migrations

If you were using v4 or v5 and skipped v6, you first need to follow
[the migration guide to version 6](./MIGRATION_TO_V6.md).

## Why required validation?

Any client-side storage (cookies, `localStorage`, `indexedDb`...) is not secure by nature,
as the client can forge the value (intentionally to attack your app, or unintentionally because it is affected by a virus or a XSS attack).

It can cause obvious **security issues**, but also **errors** and thus crashes (as the received data type may not be what you expected).

Then, **any data coming from client-side storage should be checked before used**, as mentionned in the [README](../README.md).

That's why v5 of this lib introduced a new option for `getItem()` to validate the data against a JSON schema.
But until now it was optional (to not break with previous versions and to let you use your own validation system), which is bad.

It's now time to make **validation mandatory**, as it is now possible with the new type `unknown` in TypeScript >= 3, supported by Angular >= 7.

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

It's only a convenience allowed by the library. It's useful when you're already validating the data with a JSON schema,
to cast the data type.

But **when you were not validating the data, it was really bad**.
Casting like this only means: "TypeScript, trust me, I'm telling you it will be a string".
But TypeScript won't do any real validation as it can't:
**TypeScript can only manage checks at compilation time, while client-side storage checks can only happen at runtime**.

So you ended up with a `string` type while the real data may not be a `string` at all, leading to security issues and errors.

## How to validate?

If you were not already validating your data, there are several options.

### Solution 1: JSON schema validation (recommended)

The simpler and better way to validate your data is to search `getItem` in your project 
and **use the JSON schema option proposed by the lib**. For example:

```typescript
this.localStorage.getItem<string>('test', { schema: { type: 'string' } })
.subscribe((result) => {
  result; // type: string
  result.substr(0, 2); // OK
});
```

**A [full validation guide](./VALIDATION.md) is available with all the options.**

### Solution 2: custom validation (painful)

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

You can also use any other library to validate your data. But in this case,
TypeScript won't be able to narrow the data type automatically. You can help TypeScript like this:

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

### Solution 3: defer the upgrade (temporary)

**Version 6 of the library is compatible with Angular 7.**
So you can upgrade to Angular 7 now and defer the upgrade of this lib,
to have some extra time to add validation.

Of course, it should be a temporary solution as this scenario is *not* heavily tested,
and as you'll miss new features and bug fixes.

## More documentation

- [Full changelog for v7](../CHANGELOG.md)
- [Full validation guide](./VALIDATION.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
