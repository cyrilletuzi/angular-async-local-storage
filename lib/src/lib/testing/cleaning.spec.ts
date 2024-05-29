import { IndexedDBDatabase } from "../databases/indexeddb-database";
import { MemoryDatabase } from "../databases/memory-database";
import { StorageMap } from "../storages/storage-map.service";

/**
 * Helper to clear all data in storage to avoid tests overlap
 * @param done Jasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param storageService Service
 */
export function clearStorage(done: DoneFn, storageService: StorageMap): void {

  if (storageService.backingEngine === "indexedDB") {

    try {

      const dbOpen = indexedDB.open(storageService.backingStore.database);

      dbOpen.addEventListener("success", () => {

        const storeName = storageService.backingStore.store;

        /* May be `null` if no requests were made */
        if (storeName !== "") {

          const store = dbOpen.result.transaction([storeName], "readwrite").objectStore(storeName);

          const request = store.clear();

          request.addEventListener("success", () => {

            dbOpen.result.close();

            done();

          });

          request.addEventListener("error", () => {

            dbOpen.result.close();

            done();

          });

        } else {

          dbOpen.result.close();

          done();

        }

      });

    } catch {

      localStorage.clear();

      done();

    }

  } else if (storageService.backingEngine === "localStorage") {

    localStorage.clear();

    done();

  } else if (storageService.backingEngine === "memory") {

    // eslint-disable-next-line @typescript-eslint/dot-notation
    (storageService["ɵinternalGetDatabase"]() as MemoryDatabase)["memoryStorage"].clear();

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
 * @param storageService Service
 */
export function closeAndDeleteDatabase(done: DoneFn, storageService: StorageMap): void {

  /* Only `indexedDB` is concerned */
  if (storageService.backingEngine === "indexedDB") {

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const indexedDBService = storageService["ɵinternalGetDatabase"]() as IndexedDBDatabase;

    // eslint-disable-next-line @typescript-eslint/dot-notation
    indexedDBService["database"].subscribe({
      next: (database) => {

        /* Close the database connection */
        database.close();

        /* Delete database */
        const deletingDb = indexedDB.deleteDatabase(indexedDBService.backingStore.database);

        deletingDb.addEventListener("success", () => { done(); });
        deletingDb.addEventListener("error", () => { done(); });

      },
    });

  } else {

    done();

  }

}
