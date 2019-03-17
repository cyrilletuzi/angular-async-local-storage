# Async local storage for Angular

Efficient local storage module for Angular apps and Progressive Wep apps (PWA):
- **simplicity**: based on native `localStorage` API, with automatic JSON stringify/parse,
- **perfomance**: internally stored via the asynchronous `IndexedDB` API,
- **Angular-like**: wrapped in RxJS `Observables`,
- **security**: validate data with a JSON Schema,
- **compatibility**: works around some browsers issues,
- **documentation**: API fully explained, and a changelog!
- **maintenance**: the lib follows Angular LTS and anticipates the next Angular version,
- **reference**: 1st Angular library for local storage according to [ngx.tools](https://ngx.tools/#/search?q=local%20storage).

## By the same author

- [Angular schematics extension for VS Code](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics) (GUI for Angular CLI commands)
- Other Angular libraries: [@ngx-pwa/offline](https://github.com/cyrilletuzi/ngx-pwa-offline) and [@ngx-pwa/ngsw-schema](https://github.com/cyrilletuzi/ngsw-schema)
- Popular [Angular posts on Medium](https://medium.com/@cyrilletuzi)
- Follow updates of this lib on [Twitter](https://twitter.com/cyrilletuzi)
- **[Angular onsite trainings](https://formationjavascript.com/formation-angular/)** (based in Paris, so the website is in French, but [my English bio is here](https://www.cyrilletuzi.com/en/web/) and I'm open to travel)

## Why this module?

For now, Angular does not provide a local storage module, and almost every app needs some local storage. 
There are 2 native JavaScript APIs available:
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The `localStorage` API is simple to use but synchronous, so if you use it too often, 
your app will soon begin to freeze.

The `IndexedDB` API is asynchronous and efficient, but it's a mess to use: 
you'll soon be caught by the callback hell, as it does not support Promises yet.

Mozilla has done a very great job with the [localForage library](http://localforage.github.io/localForage/): 
a simple API based on native `localStorage`,
but internally stored via the asynchronous `IndexedDB` for performance.
But it's built in ES5 old school way and then it's a mess to include into Angular.

This module is based on the same idea as localForage, but in ES6 
and additionally wrapped into [RxJS Observables](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Getting started

Install the same version as your Angular one via [npm](http://npmjs.com):

```bash
# For Angular 7 & 8:
npm install @ngx-pwa/local-storage@next

# For Angular 6:
npm install @ngx-pwa/local-storage@6
```

Now you just have to inject the service where you need it:

```typescript
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(private localStorage: LocalStorage) {}

}
```

Versions 4 & 5 (only) need an additional setup step explained in [the old module guide](./docs/OLD_MODULE.md).

### Upgrading

If you still use the old `angular-async-local-storage` package, or to update to new versions,
see the **[migration guides](./MIGRATION.md).**

## API

The API follows the [native localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage), 
except it's asynchronous via [RxJS Observables](http://reactivex.io/rxjs/).

### Writing data

```typescript
let user: User = { firstName: 'Henri', lastName: 'Bergson' };

this.localStorage.setItem('user', user).subscribe(() => {});
```

You can store any value, without worrying about stringifying.

Storing `null` or `undefined` can cause issues in some browsers, so the item will be removed instead.

### Deleting data

To delete one item:
```typescript
this.localStorage.removeItem('user').subscribe(() => {});
```

To delete all items:
```typescript
this.localStorage.clear().subscribe(() => {});
```

### Reading data

```typescript
this.localStorage.getItem<User>('user').subscribe((user) => {
  user.firstName; // should be 'Henri'
});
```

Not finding an item is not an error, it succeeds but returns `null`.
```typescript
this.localStorage.getItem('notexisting').subscribe((data) => {
  data; // null
});
```

If you tried to store `undefined`, you'll get `null` too, as some storages don't allow `undefined`.

Note you'll only get *one* value: the `Observable` is here for asynchronicity but is not meant to
emit again when the stored data is changed. And it's normal: if app data change, it's the role of your app
to keep track of it, not of this lib. See [#16](https://github.com/cyrilletuzi/angular-async-local-storage/issues/16) 
for more context and [#4](https://github.com/cyrilletuzi/angular-async-local-storage/issues/4)
for an example. 

### Checking data

Don't forget it's client-side storage: **always check the data**, as it could have been forged or deleted.

You can use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
this.localStorage.getItem('test', { type: 'string' })
.subscribe({
  next: (user) => { /* Called if data is valid or `null` */ },
  error: (error) => { /* Called if data is invalid */ },
});
```

See the [full validation guide](./docs/VALIDATION.md) to see how to validate all common scenarios.

### Subscription

You *DO NOT* need to unsubscribe: the observable autocompletes (like in the `HttpClient` service).

But you *DO* need to subscribe, even if you don't have something specific to do after writing in local storage (because it's how RxJS Observables work).

Since *version 5.2*, you can use these methods to auto-subscribe:

```typescript
this.localStorage.setItemSubscribe('user', user);
this.localStorage.removeItemSubscribe('user');
this.localStorage.clearSubscribe();
```

*Use these methods **only** if these conditions are fulfilled:*
- you don't need to manage the error callback (with these methods, errors will silently fail),
- you don't need to wait the operation to finish before the next one (remember, it's asynchronous).

### Errors

As usual, it's better to catch any potential error:
```typescript
this.localStorage.setItem('color', 'red').subscribe({
  next: () => {},
  error: (error) => {},
});
```

For read operations, you can also manage errors by providing a default value:
```typescript
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

this.localStorage.getItem('color').pipe(
  catchError(() => of('red'))
).subscribe((result) => {});
```

Could happen to anyone:
- `.setItem()`: storage is full (`DOMException` with name `'QuotaExceededError`)

Could only happen when in `localStorage` fallback:
- `.setItem()`: error in JSON serialization because of circular references (`TypeError`)
- `.getItem()`: error in JSON unserialization (`SyntaxError`)

Should only happen if data was corrupted or modified from outside of the lib:
- `.getItem()`: data invalid against your JSON schema (`ValidationError` from this lib)
- any method when in `indexedDB`: database store has been deleted (`DOMException` with name `'NotFoundError'`)

Other errors are supposed to be catched or avoided by the lib,
so if you were to run into an unlisted error, please file an issue.

### `Map`-like operations

Starting *with version >= 7.4*, in addition to the classic `localStorage`-like API,
this lib also provides some `Map`-like methods for advanced operations:
  - `.keys()` method
  - `.has(key)` method
  - `.size` property

See the [documentation](./docs/MAP_OPERATIONS.md) for more info and some recipes.

### Collision

If you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
see the [prefix guide](./docs/COLLISION.md).

## Angular support

We follow [Angular LTS support](https://angular.io/guide/releases),
meaning we support Angular >= 6, until November 2019.

This module supports [AoT pre-compiling](https://angular.io/guide/aot-compiler).

This module supports [Universal server-side rendering](https://github.com/angular/universal)
via a mock storage.

## Browser support

[All browsers supporting IndexedDB](http://caniuse.com/#feat=indexeddb), ie. **all current browsers** :
Firefox, Chrome, Opera, Safari, Edge, and IE10+.

See [the browsers support guide](./docs/BROWSERS_SUPPORT.md) for more details and special cases (like private browsing).

## Interoperability

For interoperability when mixing this lib with direct usage of native APIs or other libs like `localforage`
(which doesn't make sense in most of cases),
see the [interoperability documentation](./docs/INTEROPERABILITY.md).

## Changelog

[Changelog available here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/CHANGELOG.md), and [migration guides here](./MIGRATION.md).

## License

MIT
