import { LocalStorage } from '../lib.service';
import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';

/**
 * Helper to clear all data in storage
 * @param done Jasmine helper to explicit when the operation has ended
 * @param localStorageService Service
 */
export function clearStorage(done: DoneFn, localStorageService: LocalStorage) {

  if (localStorageService['database'] instanceof IndexedDBDatabase) {

    const indexedDBService = localStorageService['database'];

    try {

      const dbOpen = indexedDB.open(indexedDBService['dbName']);

      dbOpen.addEventListener('success', () => {

        const storeName = indexedDBService['storeName'] as string;

        const store = dbOpen.result.transaction([storeName], 'readwrite').objectStore(storeName);

        store.clear().addEventListener('success', () => {

          dbOpen.result.close();

          done();

        });

      });

      dbOpen.addEventListener('error', () => {

        dbOpen.result.close();

        localStorage.clear();

        /* Cases : Firefox private mode where `indexedDb` exists but fails */
        done();

      });

    } catch {

        localStorage.clear();

        /* Cases: IE private mode where `indexedDb` will exist but not its `open()` method */
        done();

    }

  } else if (localStorageService['database'] instanceof LocalStorageDatabase) {

    localStorage.clear();

    done();

  } else {

    localStorageService.clear().subscribe(() => {

      done();

    });

  }

}

export function closeAndDeleteDatabase(done: DoneFn, localStorageService: LocalStorage) {

  /* Avoid errors when in `localStorage` fallback */
  if (localStorageService['database'] instanceof IndexedDBDatabase) {

    const indexedDBService = localStorageService['database'];

    indexedDBService['database'].subscribe((database) => {

      database.close();

      const deletingDb = indexedDB.deleteDatabase(indexedDBService['dbName']);

      deletingDb.addEventListener('success', done);
      deletingDb.addEventListener('error', done);

    });

  } else {

    done();

  }

}
