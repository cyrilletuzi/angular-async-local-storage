# Collision guide (outdated)

`localStorage` and `IndexedDB` are restricted to the same subdomain, so no risk of collision in most cases.
*Only* if you have multiple apps on the same *sub*domain *and* you don't want to share data between them,
you need to add a prefix.

## Version

**This is an outdated guide about collision in versions < 8 of this lib.**
The up to date guide about collision for versions >= 8 is available [here](./COLLISION.md).

## Configuration

```typescript
import { localStorageProviders } from '@ngx-pwa/local-storage';

@NgModule({
  providers: [
    localStorageProviders({ prefix: 'myapp' })
  ]
})
export class AppModule {}
```

Note:
- it is an initialization step, so as mentioned in the example, **it must be done in `AppModule`**,
- **never change this option in an app already deployed in production, as all previously stored data would be lost**.

[Back to general documentation](../README.md)
