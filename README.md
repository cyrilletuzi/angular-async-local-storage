# Async local storage for Angular

Efficient client-side storage module for Angular:
- **simplicity**: simple API like native `localStorage`,
- **perfomance**: internally stored via the asynchronous `indexedDB` API,
- **Angular-like**: wrapped in RxJS `Observable`s,
- **security**: validate data with a JSON Schema,
- **compatibility**: works around some browsers issues and heavily tested via GitHub Actions,
- **documentation**: API fully explained, and a changelog!

## Status of this lib

Given my current professional situation and the lack of support for my open source work, this library is in a frozen state, meaning it is still available on npm but it will no longer get features updates or support.

## How to help?

My open source work represents *months* of full time *unpaid* work, with for example the [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics),
**used by 600 000 developers**.

So if you want to help, I released **[Schematics Pro](https://www.schematicspro.dev)**, a paid code automation tool for Angular, React, Vue, Ionic, Svelte, Stencil, Lit, Nest and more.

## Why this module?

For now, Angular does not provide a client-side storage module, and almost every app needs some client-side storage. 
There are 2 native JavaScript APIs available:
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The `localStorage` API is simple to use but synchronous, so if you use it too often, 
your app will soon begin to freeze.

The `indexedDB` API is asynchronous and efficient, but it's a mess to use: 
you'll soon be caught by the callback hell, as it does not support `Promise`s yet.

Mozilla has done a very great job with the [`localForage` library](http://localforage.github.io/localForage/): 
a simple API based on native `localStorage`,
but internally stored via the asynchronous `indexedDB` for performance.
But it's built in ES5 old school way and then it's a mess to include into Angular.

This module is based on the same idea as `localForage`, but built in ES6+ 
and additionally wrapped into [RxJS `Observable`s](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Getting started

Install the package, according to your Angular version:

```bash
# For Angular LTS (Angular >= 12):
ng add @ngx-pwa/local-storage
```

*Done!*

You should **stick to these commands**. If for any reason `ng add` does not work,
be sure to follow the [manual installation guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MANUAL_INSTALLATION.md),
as there are additionnal steps to do in addition to the package installation for some versions.

If you have multiple applications in the same project, as usual, you need to choose the project:
```bash
ng add @ngx-pwa/local-storage --project yourprojectname
```

### Upgrading

To update to new versions, see the **[migration guides](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/MIGRATION.md).**

## API

```typescript
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {
  constructor(private storage: StorageMap) {}
}
```

This service API follows the
new standard [`kv-storage` API](https://wicg.github.io/kv-storage/),
which is similar to the standard [`Map` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), and close to the
standard [`localStorage` API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage),
except it's based on [RxJS `Observable`s](https://rxjs.dev/) instead of `Promise`s:

```typescript
class StorageMap {
  // Write
  set(index: string, value: any): Observable<undefined> {}
  delete(index: string): Observable<undefined> {}
  clear(): Observable<undefined> {}

  // Read (one-time)
  get(index: string): Observable<unknown> {}
  get<T>(index: string, schema: JSONSchema): Observable<T> {}

  // Observe
  watch(index: string): Observable<unknown> {}
  watch<T>(index: string, schema: JSONSchema): Observable<T> {}

  // Advanced
  size: Observable<number>;
  has(index: string): Observable<boolean> {}
  keys(): Observable<string> {}
}
```

Note: there is also a `LocalStorage` service available,
but only for compatibility with old versions of this lib.

## How to

### Writing data

```typescript
let user: User = { firstName: 'Henri', lastName: 'Bergson' };

this.storage.set('user', user).subscribe(() => {});
```

You can store any value, without worrying about serializing. But note that:
- storing `null` or `undefined` makes no sense and can cause issues in some browsers, so the item will be removed instead,
- you should stick to JSON data, ie. primitive types, arrays and *literal* objects.
`Date`, `Map`, `Set`, `Blob` and other special structures can cause issues in some scenarios.
See the [serialization guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/SERIALIZATION.md) for more details.

### Deleting data

To delete one item:
```typescript
this.storage.delete('user').subscribe(() => {});
```

To delete all items:
```typescript
this.storage.clear().subscribe(() => {});
```

### Reading data

To get the *current* value:
```typescript
this.storage.get('user').subscribe((user) => {
  console.log(user);
});
```

Not finding an item is not an error, it succeeds but returns `undefined`:
```typescript
this.storage.get('notexisting').subscribe((data) => {
  data; // undefined
});
```

**Note you will only get *one* value**: the `Observable` is here for asynchrony but
**is *not* meant to emit again when the stored data is changed**.
If you need to watch the value, see the [watching guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/WATCHING.md).

### Checking data

Don't forget it's client-side storage: **always check the data**, as it could have been forged.

You can use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
this.storage.get('test', { type: 'string' }).subscribe({
  next: (user) => { /* Called if data is valid or `undefined` */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

**See the [full validation guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md) to see how to validate all common scenarios.**

### Subscription

You *DO NOT* need to unsubscribe: the `Observable` autocompletes (like in the Angular `HttpClient` service).

But **you *DO* need to subscribe**, even if you don't have something specific to do after writing in storage
(because it's how RxJS `Observable`s work).

### Errors

As usual, it's better to catch any potential error:
```typescript
this.storage.set('color', 'red').subscribe({
  next: () => {},
  error: (error) => {},
});
```

For read operations, you can also manage errors by providing a default value:
```typescript
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

this.storage.get('color').pipe(
  catchError(() => of('red')),
).subscribe((result) => {});
```

See the [errors guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/ERRORS.md) for some details about what errors can happen.

### Expiration

This lib, as native `localStorage` and `indexedDb`, is about *persistent* storage.

Wanting *temporary* storage (like `sessionStorage`) is a very common misconception:
an application doesn't need that. [More details here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/EXPIRATION.md).

### `Map`-like operations

In addition to the classic `localStorage`-like API,
this lib also provides a `Map`-like API for advanced operations:
  - `.keys()`
  - `.has(key)`
  - `.size`

See the [documentation](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MAP_OPERATIONS.md) for more info and some recipes.
For example, it allows to implement a multiple databases scenario.

## Support

### Browser support

This lib supports [the same browsers as Angular](https://angular.io/guide/browser-support).
See [the browsers support guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/BROWSERS_SUPPORT.md) for more details and special cases (like private browsing).

### Collision

If you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
see the [prefix guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/COLLISION.md).

### Interoperability

For interoperability when mixing this lib with direct usage of native APIs or other libs like `localForage`
(which doesn't make sense in most cases),
see the [interoperability documentation](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/INTEROPERABILITY.md).

### Changelog

[Changelog available here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/CHANGELOG.md), and [migration guides here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/MIGRATION.md).

## License

MIT
