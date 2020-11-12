# Async local storage for Angular

Efficient client-side storage module for Angular:
- **simplicity**: simple API like native `localStorage`,
- **perfomance**: internally stored via the asynchronous `indexedDB` API,
- **Angular-like**: wrapped in RxJS `Observable`s,
- **security**: validate data with a JSON Schema,
- **compatibility**: works around some browsers issues and heavily tested via GitHub Actions,
- **documentation**: API fully explained, and a changelog!

## Sponsorship

What started as a personal project is now one of the most used Angular library
for client-side storage, with more than 10 000 downloads
[on npm](https://www.npmjs.com/package/@ngx-pwa/local-storage) each week.

It's a lot of *free* work. So if your company earns money with projects using this lib,
it would be nice to **consider becoming [a sponsor](https://github.com/sponsors/cyrilletuzi)**.

## By the same author

- [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics) (GUI for Angular CLI commands)
- [typescript-strictly-typed](https://github.com/cyrilletuzi/typescript-strictly-typed): reliable code with TypeScript strictly typed
- Popular [Angular posts on Medium](https://medium.com/@cyrilletuzi)
- Follow updates of this lib on [Twitter](https://twitter.com/cyrilletuzi)
- **[Angular onsite trainings](https://formationjavascript.com/formation-angular/)** (based in Paris, so the website is in French, but [my English bio is here](https://www.cyrilletuzi.com/en/))

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
# For Angular LTS (Angular >= 9):
ng add @ngx-pwa/local-storage
```

*Done!*

You should **stick to these commands**. If for any reason `ng add` does not work,
be sure to follow the [manual installation guide](./docs/MANUAL_INSTALLATION.md),
as there are additionnal steps to do in addition to the package installation for some versions.

If you have multiple applications in the same project, as usual, you need to choose the project:
```bash
ng add @ngx-pwa/local-storage --project yourprojectname
```

### Upgrading

To update to new versions, see the **[migration guides](./MIGRATION.md).**

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

  // Observe (version >= 9)
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
See the [serialization guide](./docs/SERIALIZATION.md) for more details.

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
If you need to watch the value, see the [watching guide](./docs/WATCHING.md).

### Checking data

Don't forget it's client-side storage: **always check the data**, as it could have been forged.

You can use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
this.storage.get('test', { type: 'string' }).subscribe({
  next: (user) => { /* Called if data is valid or `undefined` */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

**See the [full validation guide](./docs/VALIDATION.md) to see how to validate all common scenarios.**

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

See the [errors guide](./docs/ERRORS.md) for some details about what errors can happen.

### Expiration

This lib, as native `localStorage` and `indexedDb`, is about *persistent* storage.

Wanting *temporary* storage (like `sessionStorage`) is a very common misconception:
an application doesn't need that. [More details here](./docs/EXPIRATION.md).

### `Map`-like operations

In addition to the classic `localStorage`-like API,
this lib also provides a `Map`-like API for advanced operations:
  - `.keys()`
  - `.has(key)`
  - `.size`

See the [documentation](./docs/MAP_OPERATIONS.md) for more info and some recipes.
For example, it allows to implement a multiple databases scenario.

## Support

### Angular support

We follow [Angular LTS support](https://angular.io/guide/releases).

This module supports [AoT pre-compiling](https://angular.io/guide/aot-compiler) and Ivy.

This module supports [Universal server-side rendering](https://github.com/angular/universal)
via a mock storage.

### Browser support

This lib supports [the same browsers as Angular](https://angular.io/guide/browser-support).
See [the browsers support guide](./docs/BROWSERS_SUPPORT.md) for more details and special cases (like private browsing).

### Collision

If you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
see the [prefix guide](./docs/COLLISION.md).

### Interoperability

For interoperability when mixing this lib with direct usage of native APIs or other libs like `localForage`
(which doesn't make sense in most cases),
see the [interoperability documentation](./docs/INTEROPERABILITY.md).

### Changelog

[Changelog available here](./CHANGELOG.md), and [migration guides here](./MIGRATION.md).

## License

MIT
