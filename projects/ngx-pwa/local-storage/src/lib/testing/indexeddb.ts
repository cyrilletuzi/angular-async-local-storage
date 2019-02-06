import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME } from '../tokens';

export function clearIndexedDB(done: DoneFn, dbName = DEFAULT_IDB_DB_NAME, storeName = DEFAULT_IDB_STORE_NAME) {

  try {

    const dbOpen = indexedDB.open(dbName);

    dbOpen.addEventListener('success', () => {

      const store = dbOpen.result.transaction([storeName], 'readwrite').objectStore(storeName);

      store.clear().addEventListener('success', () => {

        done();

      });

    });

    dbOpen.addEventListener('error', () => {

      /* Cases : Firefox private mode where `indexedDb` exists but fails */
      done();

    });

  } catch (error) {

      /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
      done();

  }

}
