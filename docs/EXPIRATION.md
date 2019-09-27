# Expiration

This lib, as native `localStorage` and `indexedDb`, is about *persistent* storage.

## Misconceptions

Wanting *temporary* storage (like `sessionStorage`) is a very common misconception:
an application doesn't need that.

This misconception comes from how we were (and still are) doing websites. As the user browses accross pages,
it may be necessary to save some data in:
- `localStorage` if we need to keep it even when he/she will leave the website and come back later,
- `sessionStorage` if we don't need to keep it for later, but just while browsing the website.

But now with tools like Angular, *from the technical side*, we're building applications, not websites anymore.
Even if we may distribute our application as what's look like as a website *from the user side*.

So it means the page never change or reload, so JavaScript is running as long as the user don't quit the app.
So **if we want to keep some data just while the user is here, we just need to store it in a classic variable, constant or property**.
You don't need local storage at all, neither temporary nor persistent.

To summarize:
- for persistent storage (if the user leaves and comes back later): `localStorage` (or `indexedDb`)
- for temporary storage (just when the user is browsing):
  - `sessionStorage` in a website
  - just variables, constants and properties in an application

## Tabs

The only case where `sessionStorage` can be legitimate in an application is if you need to share data between multiple tabs.

But it's an uncommon scenario, which can only happen if your app is distributed as a website
(it has no sense on mobile or in a desktop app).

If you really are in this case, you'll have to stick to the native `sessionStorage` API. No lib can help you on this,
as it's not possible to manage temporary data in `indexedDb`, and manually detecting when the user leaves is unreliable
(as the browser won't always fire the `unload` event, for privacy reasons).

## Expiration

Let's also make clear that this lib, as native `localStorage` and `indexedDb`, is about *persistent* storage,
but *persistent* is to understand at a theoretical level.

In practice, data may be deleted if:
- the storage becomes full, so the browser will do some cleaning
- the user can manually force the cleaning of all local data
(but note that the default cleaning options in browsers do *not* delete this kind of storage)
