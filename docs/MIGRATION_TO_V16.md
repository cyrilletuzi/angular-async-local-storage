# Migration guide to version 16

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.dev/reference/versions):

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

## Deprecations

### LocalStorage service

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

### JSONSchemaXXX specific interfaces

Specific `JSONSchemaXXX` interfaces are deprecated and will be removed in version 17. They were introduced in very old versions of this library as a workaround to some TypeScript issues which are gone for a long time now. Since version 8, you should have used the generic `JSONSchema` interface.

Note that if you are using `JSONSchemaArray` for a tuple schema, you need to switch to `JSONSchema` now because of the fix in version 16.2.0.

Example:
```typescript
// Before
const schema: JSONSchemaString = { type: 'string' };

// After
const schema: JSONSchema = { type: 'string' };
```

### JSONValidator

`JSONValidator` is deprecated and will no longer be available in version 17. It is an internal utility class which is limited, could change at any time and is out of scope of this library.

If you need a JSON validator, there are far better and dedicated libraries available like [ajv](https://ajv.js.org/).

### LocalDatabase

- `LocalDatabase` is deprecated and will no longer be available in version 17. It is an internal utility class, and overriding it is an undocumented behavior. If you are doing so, you are basically rewriting your own storage library, so using this one makes no sense, you can your service directly.

## More documentation

- [Full changelog for v16](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
