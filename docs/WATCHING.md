# Watching guide

> [!NOTE]
> - Client-side storage only makes sense for keeping data when the user *leaves* the application and comes back later; if you just need to track data when the user stays in the application, you do *not* need to watch and not even to use client-side storage: you just need a variable/property.
> - Unlike other `Observable`s of this lib, this one will not auto-complete, as the purpose is to watch indefinitely. So **be sure to unsubscribe**.
> - The library can only detect changes in storage done *with this lib* (ie. via `set()` / `.delete()` or `.clear()`). It *cannot* detect external changes (for examples via the native `indexedDB` API or via another library like `localForage`).

## Via manual subscription

```typescript
import type { Subscription } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  template: `<p>{{data}}<p>`
})
export class SomeComponent implements OnInit, OnDestroy {

  data: string;
  dataSubscription: Subscription;

  constructor(private storageMap: StorageMap) {}

  ngOnInit(): void {
    this.dataSubscription = this.storageMap.watch('somekey', { type: 'string' })
      .subscribe((result) => {
        this.data = result;
      });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }

}
```

## Via the `async` pipe

```typescript
import type { Observable } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  template: `<p>{{data$ | async}}<p>`
})
export class SomeComponent implements OnInit {

  data$: Observable<string>;

  constructor(private storageMap: StorageMap) {}

  ngOnInit(): void {
    this.data$ = this.storageMap.watch('somekey', { type: 'string' });
  }

}
```

> [!NOTE]
> As usual in Angular, do *not* use the `async` pipe twice on the same `Observable`. If you need the data in several places:

```typescript
import type { Observable } from 'rjxs';
import { StorageMap, type JSONSchema } from '@ngx-pwa/local-storage';

interface Data {
  hello: string;
  world: string;
}

@Component({
  template: `
    @if (data$ | async; as data) {
      <p>{{data.hello}}</p>
      <p>{{data.world}}</p>
    }
  `
})
export class SomeComponent implements OnInit {

  data$: Observable<Data>;

  constructor(private storageMap: StorageMap) {}

  ngOnInit(): void {

    const schema = {
      type: 'object',
      properties: {
        hello: { type: 'string' },
        world: { type: 'string' },
      },
      required: ['hello', 'world'],
    } satisfies JSONSchema;

    this.data$ = this.storageMap.watch<Data>('somekey', schema);

  }

}
```

[Back to general documentation](../README.md)
