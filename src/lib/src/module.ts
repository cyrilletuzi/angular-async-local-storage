import { NgModule, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AsyncLocalStorage } from './service/lib.service';
import { AsyncLocalDatabase, IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './service/databases/index';
import { JSONValidator } from './service/validation/index';

export function asyncLocalStorageFactory(platformId: Object, jsonValidator: JSONValidator) {

  let database: AsyncLocalDatabase;

  if (isPlatformBrowser(platformId) && ('indexedDB' in window)) {

    /* Try with IndexedDB in modern browsers */
    database = new IndexedDBDatabase(jsonValidator);

  } else if (isPlatformBrowser(platformId) && ('localStorage' in window)) {

    /* Try with localStorage in old browsers (IE9) */
    database = new LocalStorageDatabase(jsonValidator);

  } else {

    /* Fake database for server-side rendering (Universal) */
    database = new MockLocalDatabase(jsonValidator);

  }

  return new AsyncLocalStorage(database);

};

@NgModule({
  providers: [
    {
      provide: AsyncLocalStorage,
      useFactory: asyncLocalStorageFactory,
      deps: [PLATFORM_ID, JSONValidator]
    },
    JSONValidator
  ]
})
export class AsyncLocalStorageModule { }
