# Migration guide to version 17

## How to update

```
ng update @ngx-pwa/local-storage
```

> [!IMPORTANT]
> If your project is actually in a version < 16, please do the [other migrations](../MIGRATION.md) first in an incremental way. **The version 9 migration is especially important**, as a wrongly done migration could lead to the loss of all previously stored data.

## Breaking changes

- Angular 17 is required.
- RxJS >= 7.4 is required.

> [!IMPORTANT]
> RxJS 6 is *not* supported.

## Breaking changes

All things that were deprecated in version 16 are removed in version 17.

### LocalStorage service

`LocalStorage` service is removed. The `StorageMap` replacement exists since v8
now, so it is time to move forward.

Migration is very simple:

```typescript
// Before
import { LocalStorage } from "@ngx-pwa/local-storage";

@Injectable()
export class YourService {
  constructor(private storage: LocalStorage) {
    this.storage.getItem("key").subscribe();
    this.storage.setItem("key", "value").subscribe();
    this.storage.removeItem("key").subscribe();
    this.storage.clear().subscribe();
    this.storage.length;
  }
}

// After
import { StorageMap } from "@ngx-pwa/local-storage";

@Injectable()
export class YourService {
  constructor(private storage: StorageMap) {
    this.storage.get("key").subscribe();
    this.storage.set("key", "value").subscribe();
    this.storage.delete("key").subscribe();
    this.storage.clear().subscribe();
    this.storage.size;
  }
}
```

Minor typings differences:

- the `StorageMap` read method returns `undefined` if the `key` does not exist
  (the `LocalStorage` one returned `null`), so update any explicit condition:

```typescript
// Before
this.storage.getItem("key").subscribe((data) => {
  if (data !== null) {}
});

// After
this.storage.get("key").subscribe((data) => {
  if (data !== undefined) {}
});
```

- the `StorageMap` writing methods return `undefined` (the `LocalStorage` ones
  returned `true`): it is unlikely to concern you, as the return is useless for
  these methods

### JSONSchemaXXX specific interfaces

Specific `JSONSchemaXXX` interfaces are removed. They were introduced in very
old versions of this library as a workaround to some TypeScript issues which are
gone for a long time now. Since version 8, you should have used the generic
`JSONSchema` interface.

Example:

```typescript
// Before
const schema: JSONSchemaString = { type: "string" };

// After
const schema: JSONSchema = { type: "string" };
```

### JSONValidator

`JSONValidator` is removed. It was an internal utility class which is limited,
could change at any time and is out of scope of this library.

> [!TIP]
> If you need a JSON validator, there are far better and dedicated libraries
available like [ajv](https://ajv.js.org/).

### LocalDatabase

`LocalDatabase` is removed. It was an internal utility class, and overriding it is an undocumented behavior. If you are doing so, you are basically rewriting your own storage library, so using this one makes no sense, you can use your service directly.

## More documentation

- [Full changelog for v17](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
