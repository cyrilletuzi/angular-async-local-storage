# Browser support guide

This lib supports [the same browsers as Angular](https://angular.io/guide/browser-support),
ie. **all current browsers**:
- versions <= 10: Firefox, Chrome, Opera, Safari, Edge and IE9+
- version 11: Firefox, Chrome, Opera, Safari, Edge and IE11+
- version 12: IE11+ is still supported, but deprecated

This module is not impacted by IE/Edge Legacy missing `indexedDB` features.

It also works in tools based on browser engines (like Electron, WebViews, Ionic...),
but not in non-browser tools (like NativeScript, see
[#11](https://github.com/cyrilletuzi/angular-async-local-storage/issues/11)).

## Browsers restrictions

Be aware that `indexedDB` usage is limited in browsers when in private / incognito modes.
Most browsers will delete the data when the private browsing session ends. 
It's not a real issue as client-side storage is only useful for apps, and apps should not be in private mode.

In some scenarios, `indexedDB`  is not available, so the lib fallbacks to (synchronous) `localStorage`. It happens in:
- Firefox private mode (see [#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26))
- IE/Edge Legacy private mode
- Safari, when in a cross-origin iframe (see
[#42](https://github.com/cyrilletuzi/angular-async-local-storage/issues/42))

If these scenarios are a concern for you, it impacts what you can store.
See the [serialization guide](./SERIALIZATION.md) for full details.

Also, if the "Block all cookies" option has been enabled in the browser,
then all storages are blocked. In this case, the lib will fallback to an in-memory storage.

[Back to general documentation](../README.md)
