# Async local storage for Angular

Efficient client-side storage module for Angular apps and Progressive Wep Apps (PWA):
- **simplicity**: based on native `localStorage` API,
- **perfomance**: internally stored via the asynchronous `indexedDB` API,
- **Angular-like**: wrapped in RxJS `Observable`s,
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
and additionally wrapped into [RxJS `Observable`s](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Getting started

Install the right version according to your Angular one via [`npm`](http://npmjs.com):

```bash
# For Angular 8:
npm install @ngx-pwa/local-storage

# For Angular 6 & 7:
npm install @ngx-pwa/local-storage@6
```

The following second setup step is:
- **only for version >= 8**,
- not required for the lib to work,
- **strongly recommended for all new applications**, as it allows interoperability
and is future-proof, as it should become the default in a future version,
- **prohibited in applications already using this lib and already deployed in production**,
as it would break with previously stored data.

```ts
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      IDBNoWrap: true,
    })
  ]
})
export class AppModule {}
```

**Must be done at initialization, ie. in `AppModule`, and must not be loaded again in another module.**

### Upgrading

If you still use the old `angular-async-local-storage` package, or to update to new versions,
see the **[migration guides](./MIGRATION.md).**

Versions 4 & 5, which are *not* supported anymore,
needed an additional setup step explained in [the old module guide](./docs/OLD_MODULE.md).

## API

2 services are available for client-side storage, you just have to inject one of them were you need it.

### `LocalStorage`

```typescript
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private localStorage: LocalStorage) {}

}
```

This service API follows the
[native `localStorage` API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage), 
except it's asynchronous via [RxJS `Observable`s](http://reactivex.io/rxjs/):

```typescript
class LocalStorage {
  length: Observable<number>;
  getItem(index: string, schema?: JSONSchema): Observable<unknown> {}
  setItem(index: string, value: any): Observable<true> {}
  removeItem(index: string): Observable<true> {}
  clear(): Observable<true> {}
}
```

### `StorageMap`

```typescript
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private storageMap: StorageMap) {}

}
```

New *since version 8* of this lib, this service API follows the
[native `Map` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
and the new upcoming standard [kv-storage API](https://github.com/WICG/kv-storage), 
except it's asynchronous via [RxJS `Observable`s](http://reactivex.io/rxjs/).

It does the same thing as the `LocalStorage` service, but also allows more advanced operations.
If you are familiar to `Map`, we recommend to use only this service.

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

## How to

The following examples will show the 2 services for basic operations,
then stick to the `StorageMap` API. But except for methods which are specific to `StorageMap`,
you can always do the same with the `LocalStorage` API.

### Writing data

```typescript
let user: User = { firstName: 'Henri', lastName: 'Bergson' };

this.storageMap.set('user', user).subscribe(() => {});
// or
this.localStorage.setItem('user', user).subscribe(() => {});
```

You can store any value, without worrying about serializing. But note that:
- storing `null` or `undefined` makes no sense and can cause issues in some browsers, so the item will be removed instead,
- you should stick to JSON data, ie. primitive types, arrays and *literal* objects.
`Map`, `Set`, `Blob` and other special structures can cause issues in some scenarios.
See the [serialization guide](./docs/SERIALIZATION.md) for more details.

### Deleting data

To delete one item:
```typescript
this.storageMap.delete('user').subscribe(() => {});
// or
this.localStorage.removeItem('user').subscribe(() => {});
```

To delete all items:
```typescript
this.storageMap.clear().subscribe(() => {});
// or
this.localStorage.clear().subscribe(() => {});
```

### Reading data

```typescript
this.storageMap.get('user').subscribe((user) => {
  console.log(user);
});
// or
this.localStorage.getItem('user').subscribe((user) => {
  console.log(user);
});
```

Not finding an item is not an error, it succeeds but returns:
- `undefined` with `StorageMap`
```typescript
this.storageMap.get('notexisting').subscribe((data) => {
  data; // undefined
});
```
- `null` with `LocalStorage`
```typescript
this.localStorage.getItem('notexisting').subscribe((data) => {
  data; // null
});
```

Note you'll only get *one* value: the `Observable` is here for asynchrony but is not meant to
emit again when the stored data is changed. And it's normal: if app data change, it's the role of your app
to keep track of it, not of this lib. See [#16](https://github.com/cyrilletuzi/angular-async-local-storage/issues/16) 
for more context and [#4](https://github.com/cyrilletuzi/angular-async-local-storage/issues/4)
for an example. A `watch()` method may come soon
(see [#108](https://github.com/cyrilletuzi/angular-async-local-storage/pull/108))

### Checking data

Don't forget it's client-side storage: **always check the data**, as it could have been forged.

You can use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
this.storageMap.get('test', { type: 'string' }).subscribe({
  next: (user) => { /* Called if data is valid or `undefined` or `null` */ },
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
this.storageMap.set('color', 'red').subscribe({
  next: () => {},
  error: (error) => {},
});
```

For read operations, you can also manage errors by providing a default value:
```typescript
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

this.storageMap.get('color').pipe(
  catchError(() => of('red')),
).subscribe((result) => {});
```

See the [errors guide](./docs/ERRORS.md) for some details about what errors can happen.

### `Map`-like operations

Starting *with version >= 8* of this lib, in addition to the classic `localStorage`-like API,
this lib also provides a `Map`-like API for advanced operations:
  - `.keys()`
  - `.has(key)`
  - `.size`

See the [documentation](./docs/MAP_OPERATIONS.md) for more info and some recipes.
For example, it allows to implement a multiple databases scenario.

## Support

### Angular support

We follow [Angular LTS support](https://angular.io/guide/releases),
meaning we support Angular >= 6, until November 2019.

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
