# Manual installation

**For versions >= 8, you should install this library with this command:**

```bash
ng add @ngx-pwa/local-storage
```

If it causes an error, please file an issue.

In the meantime, you can proceed to a manual installation, but be sure to follow all the steps below.

## Installing the package

Install the right version according to your Angular one via [`npm`](http://npmjs.com):

```bash
# For Angular 8:
npm install @ngx-pwa/local-storage@8

# For Angular 6 & 7:
npm install @ngx-pwa/local-storage@6

# For Angular 5:
npm install @ngx-pwa/local-storage@5

# For Angular 4:
npm install @ngx-pwa/local-storage@5
```

## Importing the module

### Version 8

The following second setup step is:
- **only for version >= 8**,
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

### Version 6 (LTS support ended)

You're done, nothing else to do.

### Versions 4 & 5 (LTS support ended)

A different additional setup step is required for *versions 4 & 5 only*:
include the `LocalStorageModule` in your app root module (just once, do *not* re-import it in your submodules).

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
