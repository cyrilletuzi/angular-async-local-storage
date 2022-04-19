# Collision guide

**All client-side storages (both `indexedDB` and `localStorage`) are restricted to the same *sub*domain**,
so there is no risk of collision in most cases.
*Only* if you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
you need to add a prefix.

## Configuration

For example:

```typescript
import { StorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    StorageModule.forRoot({
      IDBDBName: 'myAppStorage', // custom database name when in `indexedDB`
      LSPrefix: 'myapp_', // prefix when in `localStorage` fallback
    })
  ]
})
export class AppModule {}
```

Note:
- it is an initialization step, so as mentioned in the example, **it must be done in `AppModule`**,
- **never change these options in an app already deployed in production, as all previously stored data would be lost**.

[Back to general documentation](../README.md)
