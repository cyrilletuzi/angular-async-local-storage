import { LocalStorage } from '../lib.service';
import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { MemoryDatabase } from '../databases/memory-database';

/**
 * Helper to clear all data in storage to avoid tests overlap
 * @param done Jasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param localStorageService Service
 */
export function clearStorage(done: DoneFn, localStorageService: LocalStorage) {

  if (localStorageService['database'] instanceof IndexedDBDatabase) {

    const indexedDBService = localStorageService['database'];

    try {

      const dbOpen = indexedDB.open(indexedDBService['dbName']);

      dbOpen.addEventListener('success', () => {

        const storeName = indexedDBService['storeName'];

        /* May be `null` if no requests were made */
        if (storeName) {

          const store = dbOpen.result.transaction([storeName], 'readwrite').objectStore(storeName);

          const request = store.clear();

          request.addEventListener('success', () => {

            dbOpen.result.close();

            done();

          });

          request.addEventListener('error', () => {

            dbOpen.result.close();

            done();

          });

        } else {

          dbOpen.result.close();

          done();

        }

      });

      dbOpen.addEventListener('error', () => {

        /* Cases : Firefox private mode where `indexedDb` exists but fails */
        localStorage.clear();

        done();

      });

    } catch {

      /* Cases: IE private mode where `indexedDb` will exist but not its `open()` method */
      localStorage.clear();

      done();

    }

  } else if (localStorageService['database'] instanceof LocalStorageDatabase) {

    localStorage.clear();

    done();

  } else if (localStorageService['database'] instanceof MemoryDatabase) {

    localStorageService['database']['memoryStorage'].clear();

    done();

  } else {

    done();

  }

}

/**
 * Now that `indexedDB` store name can be customized, it's important:
 * - to delete the database after each tests group,
 * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
 * as it's where the store is created
 * - to be able to delete the database, all connections to it must be closed
 * @param doneJasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param localStorageService Service
 */
export function closeAndDeleteDatabase(done: DoneFn, localStorageService: LocalStorage) {

  /* Only `indexedDB` is concerned */
  if (localStorageService['database'] instanceof IndexedDBDatabase) {

    const indexedDBService = localStorageService['database'];

    indexedDBService['database'].subscribe({
      next: (database) => {

        /* Close the database connection */
        database.close();

        /* Delete database */
        const deletingDb = indexedDB.deleteDatabase(indexedDBService['dbName']);

        /* Use an arrow function for done, otherwise it causes an issue in IE */
        deletingDb.addEventListener('success', () => { done(); });
        deletingDb.addEventListener('error', () => { done(); });

      },
      error: () => {

        /* Will happen in Firefox private mode if no requests have been done yet */
        done();

      }
    });

  } else {

    done();

  }

}
