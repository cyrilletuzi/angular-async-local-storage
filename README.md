# Async local storage for Angular

Efficient local storage module for Angular apps and Progressive Wep apps (PWA):
- **simplicity**: based on native `localStorage` API and automatic JSON stringify/parse,
- **perfomance**: internally stored via the asynchronous `IndexedDB` API,
- **Angular-like**: wrapped in RxJS `Observables`,
- **security**: validate data with a JSON Schema,
- **extensibility**: add your own storage.

You could also be interested by [@ngx-pwa/offline](https://github.com/cyrilletuzi/ngx-pwa-offline).

## Angular onsite training

The author of this library organizes Angular courses (based in Paris, France, but open to travel). You can find [my bio here](https://www.cyrilletuzi.com/en/web/) (in English) and [course details here](https://formationjavascript.com/formation-angular/) (in French).

## Why this module?

For now, Angular does not provide a local storage module, and almost every app needs some local storage. 
There are 2 native JavaScript APIs available:
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The `localStorage` API is simple to use but synchronous, so if you use it too often, 
your app will soon begin to freeze.

The `IndexedDB` API is asynchronous and efficient, but it's a mess to use: 
you'll soon be caught by the callback hell, as it does not support Promises yet.

Mozilla has done a very great job with the [localForage library](http://localforage.github.io/localForage/) : 
a simple API based on native `localStorage`,
but internally stored via the asynchronous `IndexedDB` for performance.
But it's built in ES5 old school way and then it's a mess to include into Angular.

This module is based on the same idea as localForage, but in ES6/ES2015 
and additionally wrapped into [RxJS Observables](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Migration from angular-async-local-storage

If you already use the previous `angular-async-local-storage` package, see the [migration guide](https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/MIGRATION.md).

## Getting started

Install the same version as your Angular one via [npm](http://npmjs.com):

```bash
# For Angular 6:
npm install @ngx-pwa/local-storage@6

# For Angular 5:
npm install @ngx-pwa/local-storage@5

# For Angular 4 (and TypeScript >= 2.3):
npm install @ngx-pwa/local-storage@4
```

Then, **for *versions 4 & 5 only*, include the `LocalStorageModule`** in your app root module (just once, do NOT re-import it in your submodules). Since *version 6*, this step is no longer required and `LocalStorageModule` is removed.

```typescript
import { LocalStorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    BrowserModule,
    LocalStorageModule,
    ...
  ]
  ...
})
export class AppModule {}
```

Now you just have to inject the service where you need it:

```typescript
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {

  constructor(protected localStorage: LocalStorage) {}

}
```

## API

The API follows the [native localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage), 
except it's asynchronous via [RxJS Observables](http://reactivex.io/rxjs/).

### Writing data

```typescript
let user: User = { firstName: 'Henri', lastName: 'Bergson' };

this.localStorage.setItem('user', user).subscribe(() => {});
```

You can store any value, without worrying about stringifying.

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

As any data can be stored, you can type your data.

Not finding an item is not an error, it succeeds but returns `null`.

```typescript
this.localStorage.getItem('notexisting').subscribe((data) => {
  data; // null
});
```

### Checking data

Don't forget it's client-side storage: **always check the data**, as it could have been forged or deleted.
Starting with *version 5*, you can use a [JSON Schema](http://json-schema.org/) to validate the data.

```typescript
import { JSONSchema } from '@ngx-pwa/local-storage';

const schema: JSONSchema = {
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  },
  required: ['firstName', 'lastName']
};

this.localStorage.getItem<User>('user', { schema }).subscribe((user) => {
  // Called if data is valid or null
}, (error) => {
  // Called if data is invalid
});
```

Note: last draft of JSON Schema is used (draft 7 at this time),
but we don't support all validation features. Just follow the interface or see [#18](https://github.com/cyrilletuzi/angular-async-local-storage/issues/18) for the full list.

Note: as the goal is validation, types are enforced: each value MUST have either `type` or `properties` or `items` or `const` or `enum`.

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

### Prefix

`localStorage` and `IndexedDB` are restricted to the same subdomain, so no risk of collision in most cases.
*Only* if you have multiple apps on the same *sub*domain *and* you don't want to share data between them, add a prefix:

```typescript
import { localStorageProviders } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({ prefix: 'myapp' })
  ]
})
export class AppModule {}
```

### Other notes

- Errors are unlikely to happen, but in an app, it's better to catch any potential error (there is currently an [issue in Firefox private browsing mode](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26)).

```typescript
this.localStorage.setItem('color', 'red').subscribe(() => {
  // Done
}, () => {
  // Error
});
```

- When reading data, you'll only get one value: the observable is here for asynchronicity but is not meant to
emit again when the stored data is changed. And it's normal: if app data change, it's the role of your app
to keep track of it, not of this lib. See [#16](https://github.com/cyrilletuzi/angular-async-local-storage/issues/16) 
for more context and [#4](https://github.com/cyrilletuzi/angular-async-local-storage/issues/4)
for an example. 

## Angular support

This lib major version is aligned to the major version of Angular. Meaning for Angular 4 you need version 4,
for Angular 5 you need version 5, for Angular 6 you need version 6, and so on.

We follow [Angular LTS support](https://github.com/angular/angular/blob/master/docs/RELEASE_SCHEDULE.md),
meaning we support Angular 4 minimum, until October 2018.

This module supports [AoT pre-compiling](https://angular.io/guide/aot-compiler).

This module supports [Universal server-side rendering](https://github.com/angular/universal)
via a mock storage.

## Browser support

[All browsers supporting IndexedDB](http://caniuse.com/#feat=indexeddb), ie. **all current browsers** :
Firefox, Chrome, Opera, Safari, Edge, and IE10+.

Local storage is required only for apps, and given that you won't do an app in older browsers,
current browsers support is far enough.

Even so, IE9 is supported but use native localStorage as a fallback, 
so internal operations are synchronous (the public API remains asynchronous-like).

This module is not impacted by IE/Edge missing IndexedDB features.

It also works in tools based on browser engines (like Electron) but not in non-browser tools (like NativeScript, see
[#11](https://github.com/cyrilletuzi/angular-async-local-storage/issues/11)).

### Private mode

Be aware that local storage is limited in browsers when in private / incognito modes. Most browsers will delete the data when the private browsing session ends. 
It's not a real issue as local storage is useful for apps, and apps should not be in private mode.

In IE / Edge, `indexedDB`  is `null` when in private mode. The lib fallbacks to (synchronous) `localStorage`.

In Firefox, `indexedDB` API is available in code but throwing error on usage. It's a bug in the browser, this lib can't handle it, see
[#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26).

## Extensibility

### Add your own storage

Starting with *version 5*, you can easily add your own storage:

```typescript
import { LocalDatabase } from '@ngx-pwa/local-storage';

export class MyDatabase implements LocalDatabase {

  /* Implement the methods required by the LocalDatabase class */

}

@NgModule({
  providers: [{ provide: LocalDatabase, useClass: MyDatabase }]
})
export class AppModule {}
```

Be sure to be compatible with Universal by checking the current platform before using any browser-specific API.

### Extend JSON Validator

You can also extend the JSON validator, but if you do so, please contribute so everyone can enjoy.

## Changelog

[Changelog available here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/CHANGELOG.md).

## License

MIT
