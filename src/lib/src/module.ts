import { AsyncLocalDatabase, IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './service/databases/index';
import { NgModule, PLATFORM_ID } from '@angular/core';

import { AsyncLocalStorage } from './service/lib.service';
import { RepositoryService } from './service/repository/repository.service';
import { isPlatformBrowser } from '@angular/common';

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
    },
    RepositoryService
  ]
})
export class AsyncLocalStorageModule { }
