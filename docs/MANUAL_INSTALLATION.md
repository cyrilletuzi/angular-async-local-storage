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
# For Angular 9:
npm install @ngx-pwa/local-storage@9

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

### Version 9

You're done, nothing else to do.

### Version 8

An additional setup step is required for *version 8 only* and **only for new applications**:

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
- **must be done at initialization, ie. in `AppModule`, and must not be loaded again in another module**,
- **never change these options in an app already deployed in production, as all previously stored data would be lost**.
If you are already using the lib, you should use the [migrations guides](../MIGRATION.md).

### Version 6

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
