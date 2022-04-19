# Browser support guide

This lib supports [the same browsers as Angular](https://angular.io/guide/browser-support).

It also works in tools based on browser engines (like Electron, WebViews, Ionic...),
but not in non-browser tools (like NativeScript, see
[#11](https://github.com/cyrilletuzi/angular-async-local-storage/issues/11)).

## Internet Explorer

Following Angular itself:
- versions <= 10: IE9+
- version 11: IE11 only
- version 12: IE11 support deprecated (but still active)
- versions >= 13: IE11 support removed

This module is not impacted by IE missing `indexedDB` features.

## Browsers restrictions

Be aware that `indexedDB` usage is limited in browsers when in private / incognito modes.
Most browsers will delete the data when the private browsing session ends. 
It's not a real issue as client-side storage is only useful for apps, and apps should not be in private mode.

In some scenarios, `indexedDB`  is not available, so the lib fallbacks to (synchronous) `localStorage`. It happens in:
- Firefox private mode (see [#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26))
- Safari, when in a cross-origin iframe (see
[#42](https://github.com/cyrilletuzi/angular-async-local-storage/issues/42))

If these scenarios are a concern for you, it impacts what you can store.
See the [serialization guide](./SERIALIZATION.md) for full details.

Also, if the "Block all cookies" option has been enabled in the browser,
then all storages are blocked. In this case, the lib will fallback to an in-memory storage.

[Back to general documentation](../README.md)
