# Interoperability

In the vast majority of cases, you'll manage *independent* apps (ie. each having its own data),
and each using only one local storage API (e.g. a native API *or* this lib, but not both at the same time in one app).

In some special cases, it could happen:
- you share the same data between multiple apps on the same subdomain,
but not all apps are built with the same framework, so each one will use a different local storage API
(e.g. an Angular app using this lib and a non-Angular app using `localForage` lib)
- while **not recommended**, you could also mix several APIs inside the same app
(e.g. mixing native `indexedDB` *and* this lib).

If you're in one of these cases, *please read this guide carefully*,
as there are important things to do and to be aware to achieve interoperability.

## Requirements

Interoperability can be achieved:
- **since v8 of this lib**,
- **only for apps that haven't been deployed in production yet**,
as v8 changed the storage system to achieve interoperability:
  - it won't work on data stored with this lib before v8, as it still uses the old storage system for backward compatibility,
  - changing configuration on the go would mean to **lose all previously stored data**.

## `indexedDB` database and object store names

When storing in `indexedDb`, names are used for the database and the object store,
so you will need that all APIs use the same names.

Option 1: keep the config of this lib and change the names in the other APIs,
by using the default values exported by the lib:

```typescript
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME } from '@ngx-pwa/local-storage';
```

Option 2: change this lib config, according to your other APIs:

```typescript
import { localStorageProviders } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({
      IDBDBName: 'customDataBaseName',
      IDBStoreName: 'customStoreName',
    })
  ]
})
export class AppModule {}
```

Note:
- it is an initialization step, so as mentioned in the example, **it must be done in `AppModule`**,
- **avoid special characters.**

## `indexedDB` store

In `indexedDB`, creating a store is only possible inside the `upgradeneeded` event,
which only happens when opening the database for the first time,
or when the version change (but this case doesn't happen in this lib).

**If this step is missing, then all `indexedDB` operations in the lib will fail as the store will be missing.**

Then, you need to ensure:
- you use the same database `version` as the lib (none or `1`),
- the store is created by:
  - by letting this lib to be initialized first (beware of concurrency issues),
  - or if another API is going first, it needs to take care of the creation of the store (with the same name).

## Limitation with `undefined`

Most librairies (like this one and `localForage`) will prevent you to store `undefined`,
by always returning `null` instead of `undefined`, due to technical issues in the native APIs.

But if you use the native APIs (`localStorage` and `indexedDb`) directly,
you could manage to store `undefined`, but it will then throw exceptions in some cases.

So **don't store `undefined`**.

## `indexedDB` keys

This lib only allows `string` keys, while `indexedDB` allows some other key types.
So if using this lib `keys()` method, all keys will be converted to `string`.
