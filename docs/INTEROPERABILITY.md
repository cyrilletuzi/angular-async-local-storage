# Interoperability

In the vast majority of cases, you'll manage *independent* apps (ie. each having its own data),
and each using only one client-side storage API
(e.g. a native API *or* this lib, but not both at the same time in one app).

In some special cases, it could happen:
- you share the same data between multiple apps on the same subdomain,
but not all apps are built with the same framework, so each one will use a different client-side storage API
(e.g. an Angular app using this lib and a non-Angular app using the `localForage` lib)
- while **not recommended**, you could also mix several APIs inside the same app
(e.g. mixing native `indexedDB` *and* this lib).

If you're in one of these cases, *please read this guide carefully*,
as there are important things to do and to be aware of to achieve interoperability.

## Requirements

Interoperability can be achieved:
- **since v8 of this lib**,
- **only for apps that haven't been deployed in production yet**,
as v8 uses the following opt-in option to allow interoperability:
changing configuration on the fly would mean to **lose all previously stored data**.

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

Note:
- it is an initialization step, so as mentioned in the examples below, **it must be done in `AppModule`**,
- **never change these options in an app already deployed in production, as all previously stored data would be lost**.

## Configuration

### `indexedDB` database and object store names

When storing in `indexedDB`, names are used for the database and the object store,
so you will need that all APIs use the same names.

- Option 1 (recommended): change this lib config, according to your other APIs:

```ts
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      IDBNoWrap: true,
      IDBDBName: 'customDataBaseName',
      IDBStoreName: 'customStoreName',
    })
  ]
})
export class AppModule {}
```

- Option 2: keep the config of this lib and change the options in the other APIs,
by using the values exported by the lib:

```ts
if (this.storageMap.backingEngine === 'indexedDB') {
  const { database, store, version } = this.storageMap.backingStore;
}
```

This second option can be difficult to manage due to some browsers issues in some special contexts
(Firefox private mode and Safari cross-origin iframes),
as **the information may be wrong at initialization,**
as the storage could fallback from `indexedDB` to `localStorage`
only after a first read or write operation.

### `localStorage` prefix

In some cases (see the [browser support guide](./BROWSERS_SUPPORT)),
`indexedDB` is not available, and libs fallback to `localStorage`.
Some libs prefixes `localStorage` keys. This lib doesn't by default,
but you can add a prefix.

- Option 1 (recommended):

```typescript
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      LSPrefix: 'myapp_',
    })
  ]
})
export class AppModule {}
```

- Option 2:

```ts
if (this.storageMap.backingEngine === 'localStorage') {
  const { prefix } = this.storageMap.fallbackBackingStore;
}
```

### Example with `localforage`

Interoperability with `localforage` lib can be achieved with this config:

```typescript
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      IDBNoWrap: true,
      LSPrefix: 'localforage/',
      IDBDBName: 'localforage',
      IDBStoreName: 'keyvaluepairs',
    })
  ]
})
export class AppModule {}
```

### Example with native `indexedDB`

Interoperability with native `indexedDB` can be achieved that way:

```ts
if (this.storageMap.backingEngine === 'indexedDB') {

  const { database, store, version } = this.storageMap.backingStore;

  const dbRequest = indexedDB.open(database, version);

  dbRequest.addEventListener('success', () => {

    const store = dbRequest.result.transaction([store], 'readonly').objectStore(store);

    const readRequest = store.get('someindex');

  });

}
```

## Warnings

### `indexedDB` store

In `indexedDB`, creating a store is only possible inside the `upgradeneeded` event,
which only happens when opening the database for the first time,
or when the version change (but this case doesn't happen in this lib).

**If this step is missing, then all `indexedDB` operations in the lib will fail as the store will be missing.**

Then, you need to ensure:
- you use the same database `version` as the lib (default to `1`),
- the store is created:
  - by letting this lib to be initialized first (beware of concurrency issues),
  - or if another API is going first, it needs to take care of the creation of the store (with the same name).

### Limitation with `undefined`

Most librairies (like this one and `localforage`) will prevent you to store `undefined`,
due to technical issues in the native APIs.

But if you use the native APIs (`localStorage` and `indexedDB`) directly,
you could manage to store `undefined`, but it will then throw exceptions in some cases.

So **don't store `undefined`**.

### `indexedDB` keys

This lib only allows `string` keys, while `indexedDB` allows some other key types.
So if you use this lib `keys()` method, all keys will be converted to a `string`.

[Back to general documentation](../README.md)
