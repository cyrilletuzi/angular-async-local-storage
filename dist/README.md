# Async local storage for Angular

Efficient local storage module for Angular : simple API based on native localStorage API, 
but internally stored via the asynchronous IndexedDB API for performance, 
and wrapped in RxJS observables to be homogeneous with other Angular asynchronous modules.

*Previously named angular2-async-local-storage.*

## Why this module ?

For now, Angular does not provide a local storage module, and almost every app needs some local storage. 
There is 2 native JavaScript APIs available :
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The localStorage API is simple to use but synchronous, so if you use it too often, 
your app will soon begin to freeze.

The IndexedDB API is asychronous and efficient, but it's a mess to use : 
you'll soon be caught by the callbacks hell, as it does not support Promises yet.

Mozilla has done a very great job with the [localForage library](http://localforage.github.io/localForage/) : 
a simple API based on native localStorage API,
but internally stored via the asynchronous IndexedDB API for performance.
But it is written in ES5 and then it's a mess to include into Angular.

This module is based on the same idea as localForage, but in ES6/ES2015 
and additionnaly wrapped into [RxJS Observables](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Getting started

Install via [npm](http://npmjs.com) :

```
npm install angular-async-local-storage --save
```

Then include the AsyncLocalStorage module in your app root module. It works like the HttpModule,
providing a global service to the whole app, so do NOT re-import it in your own sub modules.

```
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

```
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

If you use [System.js](https://github.com/systemjs/systemjs) loading in developpement, 
configure the module path like for other Angular modules :

```
System.config({
    ...
    map: {
      '@angular/core': 'node_modules/@angular/core/bundles/core.umd.js',
      ...
      'angular-async-local-storage': 'node_modules/angular-async-local-storage/bundles/async-local-storage.umd.js'
    }
    ...
});
```

## API

The API follows the [native localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage), 
except it's asynchronous via [RxJS Observables](http://reactivex.io/rxjs/).

### Writing data

Errors are unlikely to happen, but in an app you should always catch all potential errors.

You do NOT need to unsubscribe : the observable autocompletes (like in the Http service).

```
this.storage.setItem('color', 'red').subscribe(() => {
  // Done
}, () => {
  // Error
});
```

You can store any value, without worrying about stringifying.

```
this.storage.setItem('user', { firstName: 'Henri', lastName: 'Bergson' })
  .subscribe(() => {}, () => {});
```

To delete one item :

```
this.storage.removeItem('user').subscribe(() => {}, () => {});
```

To delete all items :

```
this.storage.clear().subscribe(() => {}, () => {});
```

### Reading data

Not finding an item is not an error, it succeeds but returns null.

```
this.storage.getItem('notexisting').subscribe((data) => {
  data; // null
}, () => {
  // Not called
});
```

So always check the data as it may have been removed from local storage.

```
this.storage.getItem('user').subscribe((user) => {
  if (user != null) {
    user.firstName; // 'Henri'
  }
}, () => {});
```

As any data can be stored, you need to type your data manually :
```
this.storage.getItem('color').subscribe((color: string) => {
  color; // 'red'
}, () => {});
```

## Browser support

[All browsers supporting IndexedDB](http://caniuse.com/#feat=indexeddb), ie. all current browsers :
Firefox, Chrome, Opera, Safari, Edge and IE10+.

IE8/9 are supported but use native localStorage as a fallback, 
so internal operations are synchronous (the public API remains asynchronous-like).

Older or special browsers (like Opera Mini) not supporting IndexedDB and localStorage 
use a fake storage, so the data won't be persistent but the module won't crash.

This module is not impacted by IE/Edge missing IndexedDB features.

This module has not been tested against Safari 8/9 buggy IndexedDB implementation,
but it uses very basic features of IndexedDB so it may be fine. Otherwise,
use the [IndexedDBshim polyfill](https://github.com/axemclion/IndexedDBShim).

## AoT and Universal support

This module supports [AoT pre-compiling](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html)
and [Universal server-side rendering](https://github.com/angular/universal).

## Changelog

[Changelog available here](https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/CHANGELOG.md).

## Roadmap

- Unit tests.
- Cache / preload ?

## License

MIT
