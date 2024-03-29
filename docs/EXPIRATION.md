# Expiration

This lib, as native `localStorage` and `indexedDb`, is about *persistent* storage.

## Misconceptions

Wanting *temporary* storage (like `sessionStorage`) is a very common misconception: an application does *not* need that.

This misconception comes from how we were (and still are) doing websites. As the user browses accross pages, it may be necessary to save some data in:
- `localStorage` if we need to keep it even when they will leave the website and come back later,
- `sessionStorage` if we do not need to keep it for later, but just while browsing the website.

But now with tools like Angular, *from the technical side*, we are building applications, not websites anymore. Even if we may distribute our application as what looks like as a website *from the user side*.

So it means the page never changes or reloads, so JavaScript is running as long as the user does not quit the app. So **if we want to keep some data just while the user is here, we just need to store it in a classic variable, constant or property**. You do not need client-side storage at all, neither temporary nor persistent.

If there are many of them, we may need to organize them in what we call a store, but it would still be just variables.

To summarize:
- for persistent storage (if the user leaves and comes back later): `localStorage` (or this lib)
- for temporary storage (just when the user is browsing):
  - `sessionStorage` in a website
  - just variables, constants and properties in an application

## Tabs

The only case where `sessionStorage` can be legitimate in an application is if you need to share data between multiple tabs.

But it is an uncommon scenario, which can only happen if your app is distributed as a website (it has no sense on mobile or in a desktop app).

If you really are in this case, you will have to stick to the native `sessionStorage` API. No library can help you on this, as it is not possible to manage temporary data in `indexedDb`, and manually detecting when the user leaves is unreliable (as the browser will not always fire the `unload` event, for privacy reasons).

## Theoretical persistency

Let us also make it clear that this lib, as native `localStorage` and `indexedDb`, is about *persistent* storage, but *persistent* is to understand at a theoretical level.

In practice, data may be deleted if:
- the storage becomes full, so the browser will do some cleaning
- the user can manually force the cleaning of all local data (but note that the default cleaning options in browsers do *not* delete this kind of storage)
