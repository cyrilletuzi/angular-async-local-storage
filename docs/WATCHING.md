# Watching guide

> [!NOTE]
> - Client-side storage only makes sense for keeping data when the user *leaves* the application and comes back later; if you just need to track data when the user stays in the application, you do *not* need to watch and not even to use client-side storage: you just need a variable/property.
> - Unlike other `Observable`s of this lib, this one will not auto-complete, as the purpose is to watch indefinitely. So **be sure to unsubscribe**.
> - The library can only detect changes in storage done *with this lib* (ie. via `set()` / `.delete()` or `.clear()`). It *cannot* detect external changes (for examples via the native `indexedDB` API or via another library like `localForage`).

## Via the `toSignal` in components

```typescript
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  template: `<p>{{ data() }}<p>`
})
export class SomeComponent {

  readonly #storageMap = inject(StorageMap);
  readonly data = toSignal(this.#storageMap.watch('somekey', { type: 'string' })); // automatic unsubscribe on component destroy

}
```

## Via manual subscription in services

```typescript
import type { Subscription } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Service()
export class SomeService {

  readonly #storageMap = inject(StorageMap);
  #subscription: Subscription | undefined;

  start(): void {
    this.#subscription = this.#storageMap.watch('somekey', { type: 'string' }).subscribe((result) => {
      // Do something with `result`
    });
  }

  stop(): void {
    this.#subscription?.unsubscribe();
  }

}
```

[Back to general documentation](../README.md)
