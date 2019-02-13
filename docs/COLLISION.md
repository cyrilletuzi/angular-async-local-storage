# Collision guide

`localStorage` and `IndexedDB` are restricted to the same ***sub*domain**, so no risk of collision in most cases.
*Only* if you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
you need to change the config.

## Version

This is the up to date guide about validation for version >= 8.
The old guide for validation in versions < 8 is available [here](./COLLISION_BEFORE_V8.md).

## Configuration

For example:

```typescript
import { localStorageProviders } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({
      IDBDBName: 'myAppStorage', // custom database name when in `indexedDB`
      LSPrefix: 'myapp_', // prefix when in `localStorage` fallback
    })
  ]
})
export class AppModule {}
```

Note: it is an initialization step, so as mentioned in the example, **it must be done in `AppModule`**

[Back to general documentation](../README.md)
