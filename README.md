# Async local storage for Angular

Efficient local storage module for Angular : simple API based on native localStorage API, 
but internally stored via the asynchronous IndexedDB API for performance, 
and wrapped in RxJS observables to be homogeneous with other Angular asynchronous modules.

## Why this module ?

For now, Angular does not provide a local storage module, and almost every app needs some local storage. 
There is 2 native JavaScript APIs available :
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The localStorage API is simple to use but synchronous, so if you use it too often, 
your app will soon begin to freeze.

The IndexedDB API is asynchronous and efficient, but it's a mess to use : 
you'll soon be caught by the callback hell, as it does not support Promises yet.

Mozilla has done a very great job with the [localForage library](http://localforage.github.io/localForage/) : 
a simple API based on native localStorage API,
but internally stored via the asynchronous IndexedDB API for performance.
But it is written in ES5 and then it's a mess to include into Angular.

This module is based on the same idea as localForage, but in ES6/ES2015 
and additionnaly wrapped into [RxJS Observables](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Getting started

Install via [npm](http://npmjs.com) :

```bash
npm install angular-async-local-storage
```

Then include the AsyncLocalStorage module in your app root module (just once, do NOT re-import it in your sub modules).

```typescript
import { AsyncLocalStorageModule } from 'angular-async-local-storage';

@NgModule({
  imports: [
    BrowserModule,
    AsyncLocalStorageModule,
    ...
  ]
  ...
})
export class AppModule {}
```

Now you just have to inject the service where you need it :

```typescript
import { AsyncLocalStorage } from 'angular-async-local-storage';

@Injectable()
export class YourService {

  public constructor(protected storage: AsyncLocalStorage) {}

  public ngOnInit() {

    this.storage.setItem('lang', 'fr').subscribe(() => {
      // Done
    });

  }

}
```

## API

The API follows the [native localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage), 
except it's asynchronous via [RxJS Observables](http://reactivex.io/rxjs/).

### Writing data

Errors are unlikely to happen, but in an app you should always catch all potential errors.

You DO need to subscribe, even if you don't have something specific to do after writing in local storage (because RxJS observables are cold by default).

You do NOT need to unsubscribe : the observable autocompletes (like in the Http service).

```typescript
this.storage.setItem('color', 'red').subscribe(() => {
  // Done
}, () => {
  // Error
});
```

You can store any value, without worrying about stringifying.

```typescript
this.storage.setItem('user', { firstName: 'Henri', lastName: 'Bergson' })
  .subscribe(() => {}, () => {});
```

To delete one item :

```typescript
this.storage.removeItem('user').subscribe(() => {}, () => {});
```

To delete all items :

```typescript
this.storage.clear().subscribe(() => {}, () => {});
```

### Reading data

Not finding an item is not an error, it succeeds but returns null.

```typescript
this.storage.getItem('notexisting').subscribe((data) => {
  data; // null
}, () => {
  // Not called
});
```

So always check the data as it may have been removed from local storage (done the old way here, but feel free to use RxJS filter function or else).

```typescript
this.storage.getItem('user').subscribe((user) => {
  if (user != null) {
    user.firstName; // 'Henri'
  }
}, () => {});
```

As any data can be stored, you need to type your data manually :
```typescript
this.storage.getItem<string>('color').subscribe((color) => {
  color; // 'red'
}, () => {});
```

## Angular support

The last version of this library requires Angular 4+ and TypeScript 2.3+.

If you need Angular 2 support, stay on version 1 :
```bash
npm install angular-async-local-storage@1
```

This module supports [AoT pre-compiling](https://angular.io/guide/aot-compiler).

This module supports [Universal server-side rendering](https://github.com/angular/universal)
via a mock storage.

## Browser support

[All browsers supporting IndexedDB](http://caniuse.com/#feat=indexeddb), ie. all current browsers :
Firefox, Chrome, Opera, Safari, Edge and IE10+.

Local storage is required only for apps, and given that you won't do an app in older browsers,
current browsers support is far enough.

Even so, IE9 is supported but use native localStorage as a fallback, 
so internal operations are synchronous (the public API remains asynchronous-like).

This module is not impacted by IE/Edge missing IndexedDB features.

## Changelog

[Changelog available here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/CHANGELOG.md).

## License

MIT
