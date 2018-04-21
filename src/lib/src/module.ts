import { NgModule, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { JSONValidator } from './service/validation/json-validator';
import { LocalStorage } from './service/lib.service';
import { LocalDatabase } from './service/databases/local-database';
import { IndexedDBDatabase } from './service/databases/indexeddb-database';
import { LocalStorageDatabase } from './service/databases/localstorage-database';
import { MockLocalDatabase } from './service/databases/mock-local-database';
import { LOCAL_STORAGE_PREFIX } from './tokens';

export function databaseFactory(platformId: string, prefix: string) {

  if (isPlatformBrowser(platformId) && ('indexedDB' in window) && (indexedDB !== undefined) && (indexedDB !== null)) {

    /* Try with IndexedDB in modern browsers */
    return new IndexedDBDatabase(prefix);

  } else if (isPlatformBrowser(platformId) && ('localStorage' in window) && (localStorage !== undefined) && (localStorage !== null)) {

    /* Try with localStorage in old browsers (IE9) */
    return new LocalStorageDatabase(prefix);

  } else {

    /* Fake database for server-side rendering (Universal) */
    return new MockLocalDatabase();

  }

}

@NgModule({
  providers: [
    { provide: LOCAL_STORAGE_PREFIX, useValue: '' },
    JSONValidator,
    {
      provide: LocalDatabase,
      useFactory: databaseFactory,
      deps: [PLATFORM_ID, LOCAL_STORAGE_PREFIX]
    },
    LocalStorage,
  ]
})
export class LocalStorageModule {}
