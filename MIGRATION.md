# Migration guide

## Versions aligned with Angular

This lib major version is now aligned to the major version of Angular. Meaning you need:
- v4 for for Angular 4 (same as v2),
- v5 for Angular 5 (same as v3),
- v6 for Angular 6.

## New package name

This lib has been renamed from `angular-async-local-storage` to `@ngx-pwa/local-storage`.

But do not worry: the previous package is still here and will be as long as npm exists.
You can migrate now to be ready for v6, or you can wait Angular 6 to do all the migrations at the same time.

Code did not changed, so the migration is very easy. First, uninstall the previous package:
```bash
npm uninstall angular-async-local-storage
```

Then install the new package:
```bash
# If you use Angular 5 (angular-async-local-storage v3 or v5):
npm install @ngx-pwa/local-storage
# If you use Angular 4 (angular-async-local-storage v2 or v4):
npm install @ngx-pwa/local-storage@4
# If you use Angular 6 (angular-async-local-storage v6):
npm install @ngx-pwa/local-storage@next
```

Finally, do a global search of `angular-async-local-storage` in your project, and replace with `@ngx-pwa/local-storage`.

Done.

## Shorter classes names

For shorter code and more consistency, the `Async` prefix has been dropped everywhere.
Previous classes names are still here in v4 and v5, but deprecated. They are removed in v6.

So you if you are currently Angular 4 or 5, you can update the lib without worrying, everything will still work.
But if you are updating to Angular 6, changes are required.
So when you have some time, you can easily and quickly migrate to be ready for v6 by doing a global search/replace of:
- `AsyncLocalStorageModule` => `LocalStorageModule`
- `AsyncLocalStorage` => `LocalStorage`
- `AsyncLocalDatabase` => `LocalDatabase`
- `ALSGetItemOptions` => `LSGetItemOptions`

## Version >= 6: no module needed anymore

Since *version 6*, you can delete the import of `LocalStorageModule` in your `AppModule`.
Services will be provided directly when injected.

It will be deleted in version 7.
