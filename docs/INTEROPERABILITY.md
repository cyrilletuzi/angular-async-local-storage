# Interoperability

In the vast majority of cases, you will manage *independent* apps (ie. each having its own data), and each using only one client-side storage API (e.g. a native API *or* this lib, but not both at the same time in one app).

In some special cases, it could happen:
- you share the same data between multiple apps on the same subdomain, but not all apps are built with the same framework, so each one will use a different client-side storage API (e.g. an Angular app using this library and a non-Angular app using the `localForage` lib)
- while **not recommended**, you could also mix several APIs inside the same app (e.g. mixing native `indexedDB` *and* this lib)

If you are concerned by one of these cases, *please read this guide carefully*, as there are important things to do and to be aware of to achieve interoperability.

> [!CAUTION]
> Never change the following options in an app already deployed in production, as all previously stored data would be lost.

## Requirements

If you started using this library since version >= 9, you are good to go.

If you started using this library before version 9, you need to check your `AppModule`:

```ts
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      IDBNoWrap: false, // Here
    })
  ]
})
export class AppModule {}
```

If you see this configuration (`IDBNoWrap` set to `false`), unfortunately you cannot manage interoperability, and you *cannot* change the configuration either if your app is already in production, as **it would mean the loss of all previously stored data**.

## Configuration

### `indexedDB` database and object store names

When storing in `indexedDB`, names are used for the database and the object store, so you will need that all APIs use the same names.

- Option 1 (recommended): change this library config, according to your other APIs:

```ts
import { provideIndexedDBDataBaseName, provideIndexedDBStoreName } from '@ngx-pwa/local-storage';

bootstrapApplication(AppComponent, {
  providers: [
    provideIndexedDBDataBaseName('customDataBaseName'),
    provideIndexedDBStoreName('customStoreName'),
  ]
});
```

- Option 2: keep the config of this library and change the options in the other APIs, by using the values exported by the lib:

```ts
if (this.storage.backingEngine === 'indexedDB') {
  const { database, store, version } = this.storage.backingStore;
}
```

This second option can be difficult to manage due to some browsers issues in some special contexts (like Safari cross-origin iframes), as **the information may be wrong at initialization,** as the storage could fallback from `indexedDB` to `localStorage` only after a first read or write operation.

### `localStorage` prefix

In some cases (see the [browser support guide](./BROWSERS_SUPPORT)), `indexedDB` is not available, and libraries fallback to `localStorage`. Some libraries prefixes `localStorage` keys. This library does not by default, but you can add a prefix.

- Option 1 (recommended):

```typescript
import { provideLocalStoragePrefix } from '@ngx-pwa/local-storage';

bootstrapApplication(AppComponent, {
  providers: [
    provideLocalStoragePrefix('myapp_'),
  ]
});
```

- Option 2:

```ts
if (this.storage.backingEngine === 'localStorage') {
  const { prefix } = this.storage.fallbackBackingStore;
}
```

### Example with `localforage`

Interoperability with `localforage` library can be achieved with this config:

```typescript
import { provideIndexedDBDataBaseName, provideIndexedDBStoreName, provideLocalStoragePrefix } from '@ngx-pwa/local-storage';

bootstrapApplication(AppComponent, {
  providers: [
    provideLocalStoragePrefix('localforage/'),
    provideIndexedDBDataBaseName('localforage'),
    provideIndexedDBStoreName('keyvaluepairs'),
  ]
});
```

### Example with native `indexedDB`

Interoperability with native `indexedDB` can be achieved that way:

```ts
if (this.storage.backingEngine === 'indexedDB') {

  const { database, store, version } = this.storage.backingStore;

  const dbRequest = indexedDB.open(database, version);

  dbRequest.addEventListener('success', () => {

    const store = dbRequest.result.transaction([store], 'readonly').objectStore(store);

    const readRequest = store.get('someindex');

  });

}
```

## Warnings

### `indexedDB` store

In `indexedDB`, creating a store is only possible inside the `upgradeneeded` event, which only happens when opening the database for the first time, or when the version change (but this case does not happen in this lib).

**If this step is missing, then all `indexedDB` operations in the library will fail as the store will be missing.**

Then, you need to ensure:
- you use the same database `version` as the library (default to `1`),
- the store is created:
  - by letting this library to be initialized first (beware of concurrency issues),
  - or if another API is going first, it needs to take care of the creation of the store (with the same name).

### Limitation with `undefined`

Most libraries (like this one and `localforage`) will prevent you to store `undefined`, due to technical issues in the native APIs.

But if you use the native APIs (`localStorage` and `indexedDB`) directly, you could manage to store `undefined`, but it will then throw exceptions in some cases.

So **do not store `undefined`**.

### `indexedDB` keys

This library only allows `string` keys, while `indexedDB` allows some other key types. So if you use this library `keys()` method, all keys will be converted to a `string`.

[Back to general documentation](../README.md)
