# `Map`-like operations

In addition to the classic `localStorage`-like API,
this lib also provides a partial `Map`-like API for advanced operations.

To use it:

```typescript
import { StorageMap } from '@ngx-pwa/local-storage';

export class AngularComponentOrService {

  constructor(private storage: StorageMap) {}

}
```

## `.keys()` method

An `Observable` iterating over keys in storage:

```typescript
this.storage.keys().subscribe({
  next: (key) => {
    console.log(key);
  },
  complete: () => {
    console.log('Done');
  },
});
```

Note this is an *iterating* `Observable`:
- if there is no key, the `next` callback will *not* be invoked,
- if you need to wait the whole operation to end, be sure to act in the `complete` callback,
as this `Observable` can emit several values and so will invoke the `next` callback several times.

## `.has(key)` method

Gives you an `Observable` telling you if a key exists in storage:

```typescript
this.storage.has('someindex').subscribe((result) => {

  if (result) {
    console.log('The key exists :)');
  } else {
    console.log('The key does not exist :(');
  }

});
```

## `.size` property

Number of items stored in storage.

```typescript
this.storage.size.subscribe((size) => {

  console.log(size);

});
```

## Other methods

`.values()` and `.entries()` have not been implemented on purpose,
because it has few use cases and it would not be a good idea for performance.
But you can easily do your own implementation via `keys()`. 

## Recipes

As a convenience, below are some recipes for advanced operations asked by the community.

### Multiple stores

Let's say you stored:
- some app's data with such indexes: `app_data1`, `app_data2`...
- some user's data with such indexes: `user_data1`, `user_data2`...

You can then delete only app data:

```typescript
import { filter, mergeMap } from 'rxjs/operators';

this.storage.keys().pipe(

  /* Keep only keys starting with 'app_' */
  filter((key) => key.startsWith('app_')),

  /* Remove the item for each key */
  mergeMap((key) => this.storage.delete(key))

).subscribe({
  complete: () => {

    /* Note we don't act in the classic success callback as it will be trigerred for each key,
     * while we want to act only when all the operations are done */
    console.log('Done!');

  }
});
```

[Back to general documentation](../README.md)
