# `Map`-like operations

Starting with version >= 7.4, in addition to the classic `localStorage`-like API,
this lib also provides a partial `Map`-like API for advanced operations.

## `.keys()` method

An `Observable` returning an array of keys:

```typescript
this.localStorage.keys().subscribe((keys) => {

  console.log(keys);

});
```

If there is no keys, an empty array is returned.

## `.has(key)` method

Gives you an `Observable` telling you if a key exists in storage:

```typescript
this.localStorage.has('someindex').subscribe((result) => {

  if (result) {
    console.log('The key exists :)');
  } else {
    console.log('The key does not exist :(');
  }

});
```

## `.size` property

Number of items stored in local storage.

```typescript
this.localStorage.size.subscribe((size) => {

  console.log(size);

});
```

## Other methods

`.values()` and `.entries()` have not been implemented on purpose, because it would not be a good idea for performance.
But you can easily do your own implementation via `keys()`. 

## Recipes

As a convenience, below are some recipes for advanced operations asked by the community.

### Multiple stores

Let's say you stored:
- some app's data with such indexes: `app_data1`, `app_data2`...
- some user's data with such indexes: `user_data1`, `user_data2`...

You can then delete only app data:

```typescript
import { from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

this.localStorageService.keys().pipe(

  /* Transform the array of keys in an Observable iterating over the array.
   * Why not iterating on the array directly with a `for... of` or `forEach`?
   * Because the next step (removing the item) will be asynchronous,
   * and we want to keep track of the process to know when everything is over  */
  mergeMap((keys) => from(keys)),

  /* Keep only keys starting with 'app_' */
  filter((key) => key.startsWith('app_')),

  /* Remove the item for each key */
  mergeMap((key) => localStorageService.removeItem(key))

).subscribe({ complete: () => {

  /* Note we don't act in the classic success callback as it will be trigerred for each key,
   * while we want to act only when all the operations are done */

  console.log('Done!');

} });
```
