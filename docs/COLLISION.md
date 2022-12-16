# Collision guide

**All client-side storages (both `indexedDB` and `localStorage`) are restricted to the same *sub*domain**,
so there is no risk of collision in most cases.
*Only* if you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
you need to add a prefix.

## Configuration

For example:

```typescript
import { provideLocalStoragePrefix, provideIndexedDBDataBaseName } from '@ngx-pwa/local-storage';

// Standalone application
bootstrapApplication(AppComponent, {
  providers: [
    provideLocalStoragePrefix('myapp_'), // prefix when in `localStorage` fallback
    provideIndexedDBDataBaseName('myAppStorage'), // custom database name when in `indexedDB`
  ]
});

// NgModule application
@NgModule({
  providers: [
    provideLocalStoragePrefix('myapp_'),
    provideIndexedDBDataBaseName('myAppStorage'),
  ]
})
export class AppModule {}
```

Note: **never change these options in an app already deployed in production, as all previously stored data would be lost**.

[Back to general documentation](../README.md)
