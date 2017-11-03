# Async local storage for Angular

Efficient local storage module for Angular :
- **simple** : based on native `localStorage` API,
- **perfomance** : internally stored via the asynchronous `IndexedDB` API,
- **Angular-like** : wrapped in RxJS `Observables`.

## Why this module ?

For now, Angular does not provide a local storage module, and almost every app needs some local storage. 
There is 2 native JavaScript APIs available :
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

The `localStorage` API is simple to use but synchronous, so if you use it too often, 
your app will soon begin to freeze.

The `IndexedDB` API is asynchronous and efficient, but it's a mess to use : 
you'll soon be caught by the callback hell, as it does not support Promises yet.

Mozilla has done a very great job with the [localForage library](http://localforage.github.io/localForage/) : 
a simple API based on native `localStorage`,
but internally stored via the asynchronous `IndexedDB` for performance.
But it is written in ES5 and then it's a mess to include into Angular.

This module is based on the same idea as localForage, but in ES6/ES2015 
and additionnaly wrapped into [RxJS Observables](http://reactivex.io/rxjs/) 
to be homogeneous with other Angular modules.

## Getting started

Install via [npm](http://npmjs.com) :

```bash
# For Angular 5 :
npm install angular-async-local-storage

# For Angular 4 and TypeScript >= 2.3 :
npm install angular-async-local-storage@2
```

Then include the `AsyncLocalStorage` module in your app root module (just once, do NOT re-import it in your sub modules).

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

  constructor(protected localStorage: AsyncLocalStorage) {}

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

To delete one item :

```typescript
this.localStorage.removeItem('user').subscribe(() => {});
```

To delete all items :

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
But don't forget it's client-side storage : **always check the data**, as it could have been forged or deleted.

### Notes

Not finding an item is not an error, it succeeds but returns `null`.

```typescript
this.localStorage.getItem('notexisting').subscribe((data) => {
  data; // null
});
```

Errors are unlikely to happen, but in an app it's better to catch any potential error.

```typescript
this.localStorage.setItem('color', 'red').subscribe(() => {
  // Done
}, () => {
  // Error
});
```

You *DO* need to subscribe, even if you don't have something specific to do after writing in local storage (because it's how RxJS Observables work).

You do *NOT* need to unsubscribe : the observable autocompletes (like in the `HttpClient` service).

## Angular support

The last version of this library requires **Angular 5**.

If you need support for previous versions of Angular, stay on older versions, like mentionned in Getting started.

This module supports [AoT pre-compiling](https://angular.io/guide/aot-compiler).

This module supports [Universal server-side rendering](https://github.com/angular/universal)
via a mock storage.

## Browser support

[All browsers supporting IndexedDB](http://caniuse.com/#feat=indexeddb), ie. **all current browsers** :
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

## Angular onsite training

The author of this library organizes Angular courses, mostly in Paris (France). You can find [details here](https://formationjavascript.com/formation-angular/) (in French).
