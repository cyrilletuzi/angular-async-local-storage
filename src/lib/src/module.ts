import { NgModule, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AsyncLocalStorage } from './service/lib.service';
import { AsyncLocalDatabase, IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './service/databases/index';

export function asyncLocalStorageFactory(platformId: Object) {

  let database: AsyncLocalDatabase;

  if (isPlatformBrowser(platformId) && ('indexedDB' in window)) {

    /* Try with IndexedDB in modern browsers */
    database = new IndexedDBDatabase();

  } else if (isPlatformBrowser(platformId) && ('localStorage' in window)) {

    /* Try with localStorage in old browsers (IE9) */
    database = new LocalStorageDatabase();

  } else {

    /* Fake database for server-side rendering (Universal) */
    database = new MockLocalDatabase();

  }

  return new AsyncLocalStorage(database);

};

@NgModule({
  providers: [
    {
      provide: AsyncLocalStorage,
      useFactory: asyncLocalStorageFactory,
      deps: [PLATFORM_ID]
    }
  ]
})
export class AsyncLocalStorageModule { }
