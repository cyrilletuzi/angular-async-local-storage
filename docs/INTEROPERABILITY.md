# Interoperability

In the vast majority of cases, you'll manage *independent* apps (ie. each having its own data),
and each using only one local storage API (e.g. a native API *or* this lib, but not both).

In some special cases, it could happen:
- you share the same data between multiple apps on the same subdomain,
but not all are built with the same framework, so each one will use a different local storage API
(e.g. an Angular app using this lib and a non-Angular app using `localForage` lib)
- even if it's not recommended, you could also mix several APIs inside the same app
(e.g. mixing native `localStorage` *and* this lib).

Interoperability can be achieved since v7.3.0 of this lib, given some limitations and adaptations.

## Wrapping of values

For legacy reasons, when storing in `indexedDb`, this lib currently wraps the value in this structure: `{ value: ... }`.

So if you usesvthe native `indexedDb` API directly, you need:
- to follow the same structure,
- to **not** store literally `{ value: ... }` as a real value, as the lib won't be able to know
if it's a raw value or the wrapping; instead, store `{ value: { value: ... } }`.

Unwrapping is considered in [#67](https://github.com/cyrilletuzi/angular-async-local-storage/issues/67).

## Limitation with `undefined`

Most librairies (like this one and `localForage`) will prevent you to store `undefined`,
by always returning `null` instead of `undefined`, due to technical issues in the native APIs.

But if you use the native APIs (`localStorage` and `indexedDb`) directly,
you could manage to store `undefined`, but it will then throw exceptions in some cases.

So **don't store `undefined`**.
