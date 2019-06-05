# Browser support guide

This lib supports [all browsers supporting `indexedDB`](http://caniuse.com/#feat=indexeddb), ie. **all current browsers** :
Firefox, Chrome, Opera, Safari, Edge, and IE10+.

Client-side storage is required only for apps, and given that you won't do an app in older browsers,
current browsers support is far enough.

Even so, IE9 is supported but use native `localStorage` as a fallback, 
so internal operations are synchronous (the public API remains asynchronous-like).

This module is not impacted by IE/Edge missing `indexedDB` features.

It also works in tools based on browser engines (like Electron, WebViews, Ionic...),
but not in non-browser tools (like NativeScript, see
[#11](https://github.com/cyrilletuzi/angular-async-local-storage/issues/11)).

## Browsers restrictions

Be aware that `indexedDB` usage is limited in browsers when in private / incognito modes.
Most browsers will delete the data when the private browsing session ends. 
It's not a real issue as client-side storage is only useful for apps, and apps should not be in private mode.

In some scenarios, `indexedDB`  is not available, so the lib fallbacks to (synchronous) `localStorage`. It happens in:
- Firefox private mode (see [#26](https://github.com/cyrilletuzi/angular-async-local-storage/issues/26))
- IE/Edge private mode
- Safari, when in a cross-origin iframe (see
[#42](https://github.com/cyrilletuzi/angular-async-local-storage/issues/42))

If these scenarios are a concern for you, it impacts what you can store.
See the [serialization guide](./SERIALIZATION.md) for full details.

Also, if the "Block all cookies" option has been enabled in the browser,
then all storages are blocked. In this case, the lib will fallback to an in-memory storage.

[Back to general documentation](../README.md)
