# Prefix guide

`localStorage` and `IndexedDB` are restricted to the same subdomain, so no risk of collision in most cases.
*Only* if you have multiple apps on the same *sub*domain *and* you don't want to share data between them, add a prefix:

```typescript
import { localStorageProviders } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({ prefix: 'myapp' })
  ]
})
export class AppModule {}
```

[Back to general documentation](../README.md)
