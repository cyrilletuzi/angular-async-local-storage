# Migration guide to version 16

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.io/guide/releases):

> If you are updating from one major version to another, then we recommend that you do not skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 14.x.x to version 16.x.x, we recommend that you update to the latest 15.x.x release first. After successfully updating to 15.x.x, you can then update to 16.x.x.

**So if you update from version < 9, please do the [other migrations](../MIGRATION.md) first**. The version 9 migration is especially important, as a wrongly done migration could lead to the loss of all previously stored data.

## How to update

```
ng update @ngx-pwa/local-storage
```

## Breaking changes

- Angular 16 is required.
- RxJS >= 7.4 is required. RxJS 6 is not supported.
- TypeScript 5.0 is recommended (TypeScript 4.9 should work but is not tested).

## Deprecation

`LocalStorage` service is deprecated and will be removed in v17. The `StorageMap` replacement exists since v8 now, so it is time to move forward.

Migration is very simple:

```typescript
// Before
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {
  constructor(private storage: LocalStorage) {
    this.storage.getItem('key').subscribe();
    this.storage.setItem('key', 'value').subscribe();
    this.storage.removeItem('key').subscribe();
    this.storage.clear().subscribe();
    this.storage.length;
  }
}

// After
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class YourService {
  constructor(private storage: StorageMap) {
    this.storage.get('key').subscribe();
    this.storage.set('key', 'value').subscribe();
    this.storage.delete('key').subscribe();
    this.storage.clear().subscribe();
    this.storage.size;
  }
}
```

Minor typings differences:
- the `StorageMap` read method returns `undefined` if the `key` does not exist (the `LocalStorage` one returned `null`), so update any explicit condition:
```typescript
// Before
this.storage.getItem('key').subscribe((data) => {
  if (data !== null) {}
});

// After
this.storage.get('key').subscribe((data) => {
  if (data !== undefined) {}
});
```
- the `StorageMap` writing methods return `undefined` (the `LocalStorage` ones returned `true`): it is unlikely to concern you, as the return is useless for these methods

## More documentation

- [Full changelog for v16](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
