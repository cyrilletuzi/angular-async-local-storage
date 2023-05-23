# Errors guide

As usual, it's better to catch any potential error:
```typescript
this.storage.set('color', 'red').subscribe({
  next: () => {},
  error: (error) => {},
});
```

For read operations, you can also manage errors by providing a default value:
```typescript
import { catchError, of } from 'rxjs';

this.storage.get('color').pipe(
  catchError(() => of('red')),
).subscribe((result) => {});
```

Could happen to anyone:
- `.set()`: storage is full (`DOMException` with name `QuotaExceededError`)
- `.set()`: value is too big (`DOMException` with name `UnknownError`),
for example Chromium-based browsers have a 133169152 bytes limit

Could only happen when in `localStorage` fallback:
- `.set()`: error in JSON serialization because of circular references (`TypeError`)
- `.set()`: trying to store data that can't be serialized like `Blob`, `Map` or `Set` (`SerializationError` from this lib)
- `.get()`: error in JSON unserialization (`SyntaxError`)

Should only happen if data was corrupted or modified from outside of the lib:
- `.get()`: data invalid against your JSON schema (`ValidationError` from this lib)
- any method when in `indexedDB`: database store has been deleted (`DOMException` with name `NotFoundError`)

Could only happen when in Safari private mode:
- `.set()`: trying to store a `Blob`

Other errors are supposed to be catched or avoided by the lib,
so if you were to run into an unlisted error, please file an issue.

[Back to general documentation](../README.md)
