# Browser support guide

Starting with version >= 7.1, in addition to the classic `localStorage`-like API,
this lib also provides `Map`-like methods for advanced operations:
- `.keys()`

As a convenience, below are some recipes for operations asked by the community.

## Multiple stores

Let's say you stored:
- some app's data with such indexes: `app_data1`, `app_data2`...
- some user's data with such indexes: `user_data1`, `user_data2`...

You can then delete only app data:

```typescript
this.localStorage.keys().pipe(
  filter((key) => key.startsWith('app_')),
  mergeMap((key) => this.localStorage.removeItem(key))
).subscribe({ complete: () => {

  // Be sure to act on complete, and not on success as usual,
  // as this Obserbable will emit several times, for each key

} });
```
