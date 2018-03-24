import { NgModule, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { JSONValidator } from './service/validation/json-validator';
import { AsyncLocalStorage } from './service/lib.service';
import { AsyncLocalDatabase } from './service/databases/async-local-database';
import { IndexedDBDatabase } from './service/databases/indexeddb-database';
import { LocalStorageDatabase } from './service/databases/localstorage-database';
import { MockLocalDatabase } from './service/databases/mock-local-database';

export function databaseFactory(platformId: Object) {

  if (isPlatformBrowser(platformId) && ('indexedDB' in window) && (indexedDB !== undefined) && (indexedDB !== null)) {

    /* Try with IndexedDB in modern browsers */
    return new IndexedDBDatabase();

  } else if (isPlatformBrowser(platformId) && ('localStorage' in window) && (localStorage !== undefined) && (localStorage !== null)) {

    /* Try with localStorage in old browsers (IE9) */
    return new LocalStorageDatabase();

  } else {

    /* Fake database for server-side rendering (Universal) */
    return new MockLocalDatabase();

  }

}

@NgModule({
  providers: [
    JSONValidator,
    {
      provide: AsyncLocalDatabase,
      useFactory: databaseFactory,
      deps: [PLATFORM_ID]
    },
    AsyncLocalStorage,
  ]
})
export class AsyncLocalStorageModule {}
