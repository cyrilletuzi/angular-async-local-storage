# Async local storage for Angular

Efficient client-side storage module for Angular apps and Progressive Wep Apps (PWA):
- **simplicity**: a `Promise`-based API similar to native `localStorage`,
- **scalability**: or an `Observable`-based API similar to native `Map` and `kv-storage` for advanced cases,
- **perfomance**: internally stored via the asynchronous `indexedDB` API,
- **security**: validate data with a JSON Schema,
- **compatibility**: works around some browsers issues,
- **documentation**: API fully explained, and a changelog!
- **reference**: 1st Angular library for client-side storage according to [ngx.tools](https://ngx.tools/#/search?q=local%20storage).

## By the same author

- [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics) (GUI for Angular CLI commands)
- Other Angular library: [@ngx-pwa/offline](https://github.com/cyrilletuzi/ngx-pwa-offline)
- Popular [Angular posts on Medium](https://medium.com/@cyrilletuzi)
- Follow updates of this lib on [Twitter](https://twitter.com/cyrilletuzi)
- **[Angular onsite trainings](https://formationjavascript.com/formation-angular/)** (based in Paris, so the website is in French, but [my English bio is here](https://www.cyrilletuzi.com/en/web/) and I'm open to travel)

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
and with additional tools like [RxJS `Observable`s](https://rxjs.dev/) 
to be homogeneous with other Angular modules.

## Getting started

Install the package, according to your Angular version:

```bash
# For Angular 8:
ng add @ngx-pwa/local-storage

# For Angular 6 & 7:
npm install @ngx-pwa/local-storage@6
```

*Done!*

You should **stick to these commands**. If for any reason `ng add` does not work,
be sure to follow the [manual installation guide](./docs/MANUAL_INSTALLATION.md),
as there are additionnal steps to do in addition to the package installation.

If you have multiple applications in the same project, as usual, you need to choose the project:
```bash
ng add @ngx-pwa/local-storage --project yourprojectname
```

### Upgrading

If you still use the old `angular-async-local-storage` package, or to update to new versions,
see the **[migration guides](./MIGRATION.md).**

## API

3 services are available for client-side storage, you just have to inject one of them were you need it.

### `KVStorage` (`Promise`-based)

New *since version 9* of this lib, this service is recommended for **simple cases**.

```typescript
import { KVStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private kvStorage: KVStorage) {}

}
```

This service API follows the
new standard [`kv-storage` API](https://wicg.github.io/kv-storage/):

```typescript
class KVStorage {
  get(index: string, schema?: JSONSchema): Promise<unknown> {}
  set(index: string, value: any): Promise<undefined> {}
  delete(index: string): Promise<undefined> {}
  clear(): Promise<undefined> {}
}
```


### `StorageMap` (`Observable`-based)

New *since version 8* of this lib, this service is recommended for **advanced cases**.

```typescript
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private storageMap: StorageMap) {}

}
```

This service API follows the
[native `Map` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
and the new standard [kv-storage API](https://github.com/WICG/kv-storage), 
except it's wrapped in [RxJS `Observable`s](https://rxjs.dev/).

It does the same thing as the `KVStorage` service, but also allows more advanced operations.

```typescript
class StorageMap {
  size: Observable<number>;
  get(index: string, schema?: JSONSchema): Observable<unknown> {}
  set(index: string, value: any): Observable<undefined> {}
  delete(index: string): Observable<undefined> {}
  clear(): Observable<undefined> {}
  has(index: string): Observable<boolean> {}
  keys(): Observable<string> {}
}
```

### `LocalStorage` (legacy)

You can keep this legacy service in existing apps, but it's *not* recommended anymore.

```typescript
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private localStorage: LocalStorage) {}

}
```

This service API follows the
standard [`localStorage` API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage), 
except it's asynchronous via [RxJS `Observable`s](https://rxjs.dev/):

```typescript
class LocalStorage {
  length: Observable<number>;
  getItem(index: string, schema?: JSONSchema): Observable<unknown> {}
  setItem(index: string, value: any): Observable<true> {}
  removeItem(index: string): Observable<true> {}
  clear(): Observable<true> {}
}
```

## How to

The following examples will show examples with the 2 recommended services.
But for older versions, you can always do the same with the `LocalStorage` API.

### Writing data

```typescript
const user: User = { firstName: 'Henri', lastName: 'Bergson' };

// Promise-based
await this.kvStorage.set('user', user);

// Observable-based
this.storageMap.set('user', user).subscribe(() => {});
```

You can store any value, without worrying about serializing. But note that:
- storing `null` or `undefined` makes no sense and can cause issues in some browsers, so the item will be removed instead,
- you should stick to JSON data, ie. primitive types, arrays and *literal* objects.
`Date`, `Map`, `Set`, `Blob` and other special structures can cause issues in some scenarios.
See the [serialization guide](./docs/SERIALIZATION.md) for more details.

### Deleting data

To delete one item:
```typescript
// Promise-based
await this.kvStorage.delete('user', user);

// Observable-based
this.storageMap.delete('user', user).subscribe(() => {});
```

To delete all items:
```typescript
// Promise-based
await this.kvStorage.clear('user', user);

// Observable-based
this.storageMap.clear('user', user).subscribe(() => {});
```

### Reading data

```typescript
// Promise-based
const user = await this.kvStorage.get('user');
console.log(user);

// Observable-based
this.storageMap.get('user').subscribe((user) => {
  console.log(user);
});
```

Not finding an item is not an error, it succeeds but returns `undefined` (or `null` with legacy `LocalStorage`):
```typescript
// Promise-based
const data = await this.kvStorage.get('notexisting'); // undefined

// Observable-based
this.storageMap.get('notexisting').subscribe((data) => {
  data; // undefined
});
```

Note you'll only get *one* value: the `Promise` or `Observable` is here for asynchrony but is not meant to
emit again when the stored data is changed. And it's normal: if app data change, it's the role of your app
to keep track of it, not of this lib. See [#16](https://github.com/cyrilletuzi/angular-async-local-storage/issues/16) 
for more context and [#4](https://github.com/cyrilletuzi/angular-async-local-storage/issues/4)
for an example. A `watch()` method may come soon
(see [#108](https://github.com/cyrilletuzi/angular-async-local-storage/pull/108))

### Checking data

Don't forget it's client-side storage: **always check the data**, as it could have been forged.

You can use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
// Promise-based
try {
  const data = await this.kvStorage.get('test', { type: 'string' });
  /* Called if data is valid or `undefined` */
} catch (error) { /* Called if data is invalid */ }

// Observable-based
this.storageMap.get('test', { type: 'string' }).subscribe({
  next: (user) => { /* Called if data is valid or `undefined` */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

**See the [full validation guide](./docs/VALIDATION.md) to see how to validate all common scenarios.**

### Subscription

If using one of the `Observable`-based API, you *DO NOT* need to unsubscribe:
the `Observable` autocompletes (like in the Angular `HttpClient` service).

But **you *DO* need to subscribe**, even if you don't have something specific to do after writing in storage
(because it's how RxJS `Observable`s work).

### Errors

As usual, it's better to catch any potential error:
```typescript
// Promise-based
try {
  await this.kvStorage.set('color', 'red');
} catch (error) {}

// Observable-based
this.storageMap.set('color', 'red').subscribe({
  next: () => {},
  error: (error) => {},
});
```

For read operations, you can also manage errors by providing a default value:
```typescript
// Promise-based
let color = 'red';
try {
  color = await this.kvStorage.get('color');
} catch (error) {}

// Observable-based
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

this.storageMap.get('color').pipe(
  catchError(() => of('red')),
).subscribe((result) => {});
```

See the [errors guide](./docs/ERRORS.md) for some details about what errors can happen.

### `Map`-like operations

Starting *with version >= 8* of this lib,
this lib also provides a `Map`-like API for advanced operations:
  - `.keys()`
  - `.has(key)`
  - `.size`

See the [documentation](./docs/MAP_OPERATIONS.md) for more info and some recipes.
For example, it allows to implement a multiple databases scenario.

## Support

### Angular support

We follow [Angular LTS support](https://angular.io/guide/releases),
meaning we support Angular >= 7, until April 2020.

This module supports [AoT pre-compiling](https://angular.io/guide/aot-compiler) and Ivy.

This module supports [Universal server-side rendering](https://github.com/angular/universal)
via a mock storage.

### Browser support

[All browsers supporting IndexedDB](https://caniuse.com/#feat=indexeddb), ie. **all current browsers** :
Firefox, Chrome, Opera, Safari, Edge, and IE10+.

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
