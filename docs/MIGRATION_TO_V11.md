# Migration guide to version 11

## LTS support ended

[Angular version 11 is officially outdated](https://angular.dev/reference/versions).

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.dev/reference/versions):

> If you are updating from one major version to another, then we recommend that you do not skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 9.x.x to version 11.x.x, we recommend that you update to the latest 10.x.x release first. After successfully updating to 10.x.x, you can then update to 11.x.x.

**So if you update from version < 9, please do the [other migrations](../MIGRATION.md) first**. The version 9 migration is especially important, as a wrongly done migration could lead to the loss of all previously stored data.

## How to update

Then:

```
ng update @ngx-pwa/local-storage
```

Done!

## Changes

### Typings

TypeScript typings for `.get()` and `.watch()` has been modified to better match the library behavior.

For now, wrong usages are just marked as deprecated, so there is **no breaking change** and it will just be reported by linters. But they may be removed in future releases.

Be sure to read the [validation guide](./docs/VALIDATION.md) for all the why and how of validation.

1. **Cast without a JSON schema**

```ts
this.storage.get<User>('user');
```
was allowed but the result was still `unknown`.

This is a very common misconception of client-side storage: you can store and get anything in storage, so many people think that casting as above is enough to get the right result type. It is not.

Why? Because you are getting data from *client-side* storage: so it may have been modified (just go to your browser developer tools and hack what you want).

A cast is just an information for *compilation*: it basically says to TypeScript: "believe me, it will be a `User`". But **that is not true: you are not sure you will get a `User`**.

This is why this library provides a *runtime* validation system, via a JSON schema as the second parameter:

```ts
this.storage.get<User>('user', {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
});
```

2. **Non-primitive JSON schema without a cast**

```ts
this.storage.get('user', {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
});
```
was allowed but the result was still `unknown`.

This is because, for now, the library is able to infer the return type based on the JSON schema for primitives (`string`, `number`, `integer`, `boolean` and `array` of these), but not for more complex structures like objects.

So in this case, both the JSON schema and the cast are required:

```ts
this.storage.get<User>('user', {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
});
```

Be aware **you are responsible the casted type (`User`) describes the same structure as the JSON schema**. For the same reason, the library cannot check that.

3. **Mismatch between cast and primitive JSON schema**

```ts
this.storage.get<number>('name', { type: 'string' });
```
was allowed but is of course an error. Now the match between the cast and simple JSON schemas (`string`, `number`, `integer`, `boolean` and `array` of these) is checked.

Note that in this scenario, the cast is not needed at all, it will be automatically inferred by the lib, so just do:

```ts
this.storage.get('name', { type: 'string' });
```

4. **JSON schema with `as const` assertion**

Given how JSON schema works, sometimes it is better to set them `as const`:

```ts
this.storage.get('name', { type: 'string' } as const);
```

But before v11, it was not possible when using some JSON schema properties (`enum`, `items`, `required`). This is now fixed.

## More documentation

- [Full changelog for v11](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
