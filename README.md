# Async local storage for Angular

Efficient client-side storage for Angular:
- **simplicity**: simple API similar to native `localStorage`,
- **perfomance**: internally stored via the asynchronous `indexedDB` API,
- **Angular-like**: wrapped in RxJS `Observable`s,
- **security**: validate data with a JSON Schema or with [`typebox`](https://github.com/sinclairzx81/typebox),
- **compatibility**: works around some browsers issues and heavily tested via GitHub Actions,
- **documentation**: API fully explained, and a changelog!

## By the same author

I am also the author of the [Angular Schematics extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics), installed nearly 1 million times. Feel free to give it a try.

## Why this lib?

Angular does not provide a client-side storage service, and almost every app needs some client-side storage. There are 2 native JavaScript APIs available:
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The `localStorage` API is simple to use but synchronous, so if you use it too often, your app will soon begin to freeze.

The `indexedDB` API is asynchronous and efficient, but it is a mess to use:  you will soon be caught by the callback hell, as it does not support `Promise`s.

This library has a simple API similar to native `localStorage`, but internally stores data via the asynchronous `indexedDB` for performance. All of this powered by [RxJS](https://rxjs.dev/).

## Getting started

Install the package:

```bash
# For Angular LTS (Angular >= 15):
ng add @ngx-pwa/local-storage
```

*Done!*

If for any reason `ng add` does not work, follow the [manual installation guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MANUAL_INSTALLATION.md).

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

This service API is similar to the standard [`Map` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), and close to the standard [`localStorage` API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage).

```typescript
class StorageMap {
  // Write
  set(index: string, value: unknown): Observable<undefined> {}
  delete(index: string): Observable<undefined> {}
  clear(): Observable<undefined> {}

  // Read (one-time)
  get(index: string): Observable<unknown> {}
  get<T>(index: string, schema: JSONSchema): Observable<T> {}

  // Advanced
  watch(index: string): Observable<unknown> {}
  watch<T>(index: string, schema: JSONSchema): Observable<T> {}
  size: Observable<number>;
  has(index: string): Observable<boolean> {}
  keys(): Observable<string> {}
}
```

## How to

### Writing data

```typescript
let user: User = { firstName: 'Henri', lastName: 'Bergson' };

this.storage.set('user', user).subscribe(() => {});
```

> [!NOTE]
> You can store any value, without worrying about serializing. But note that:
> - storing `null` or `undefined` makes no sense and can cause issues in some browsers, so the item will be removed instead,
> - you should stick to JSON data, ie. primitive types, arrays and *literal* objects. `Date`, `Map`, `Set`, `Blob` and other special structures can cause issues in some scenarios. Read the [serialization guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/SERIALIZATION.md) for more details.

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

> [!IMPORTANT]
> You will only get *one* value: the `Observable` is here for asynchrony but is *not* meant to emit again when the stored data is changed. If you need to watch the value, read the [watching guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/WATCHING.md).

### Checking data

Do not forget it is client-side storage: **always check the data**, as it could have been forged.

You **should** use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
this.storage.get('test', { type: 'string' }).subscribe({
  next: (user) => { /* Called if data is valid or `undefined` */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

> [!TIP]
> Read the [full validation guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md) to learn how to validate all common scenarios.

### Subscription

You do *NOT* need to unsubscribe: the `Observable` autocompletes (like in the Angular `HttpClient` service).

But **you *DO* need to subscribe**, even if you do not have something specific to do after writing in storage (because it is how RxJS `Observable`s work).

```typescript
this.storage.set('user', user); // Does nothing
```

### Errors

As usual, it is better to catch any potential error:
```typescript
this.storage.set('color', 'red').subscribe({
  next: () => {},
  error: (error) => {},
});
```

For read operations, you can also manage errors by providing a default value:
```typescript
import { catchError, of } from 'rxjs';

this.storage.get('color').pipe(
  catchError(() => of('red')),
).subscribe((result) => {});
```

> [!TIP]
> Read the [errors guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/ERRORS.md) for some details about what errors can happen.

### Expiration

This lib, as native `localStorage` and `indexedDb`, is about *persistent* storage.

Wanting *temporary* storage (like `sessionStorage`) is a very common misconception: an application does not need that.

> [!TIP]
> Read [the expiration guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/EXPIRATION.md).

### `Map`-like operations

In addition to the classic `localStorage`-like API, this library also provides a `Map`-like API for advanced operations:
  - `.keys()`
  - `.has(key)`
  - `.size`

> [!TIP]
> Read the [Map-like operations guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/MAP_OPERATIONS.md) for more info and some recipes. For example, it allows to implement a multiple databases scenario.

## Support

### Browser support

This library supports [the same browsers as Angular](https://angular.dev/reference/versions).

> [!TIP]
Read [the browsers support guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/BROWSERS_SUPPORT.md) for more details and special cases (like private browsing).

### Collision

The library has configurable options if you have multiple apps on the same *sub*domain *and* you do not want to share data between them.

> [!TIP]
> Read the [collision guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/COLLISION.md).

### Interoperability

The library has configurable options for interoperability when mixing this library with direct usage of native APIs or other libraries like `localForage` (which does not make sense in most cases).

> [!TIP]
> Read the [interoperability documentation](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/INTEROPERABILITY.md).

### Changelog

[Changelog available here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/CHANGELOG.md), and [migration guides here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/MIGRATION.md).

## License

MIT
