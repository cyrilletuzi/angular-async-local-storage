import { clearStorage, closeAndDeleteDatabase } from './cleaning';
import { StorageMap } from '../storages';
import { IndexedDBDatabase } from '../databases';
import { JSONSchema } from '../validation';
import { DEFAULT_IDB_STORE_NAME } from '../tokens';

const dbName = `interopStore${Date.now()}`;
const index = 'test';

/**
 * Set a value with native `indexedDB` API and try to override it with the lib
 * @param localStorageService Service
 * @param done Jasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param value Value to store
 */
function testSetCompatibilityWithNativeAPI(localStorageService: StorageMap, done: DoneFn, value: any) {

  try {

    const dbOpen = indexedDB.open(dbName);

    dbOpen.addEventListener('upgradeneeded', () => {

      if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

        /* Create the object store */
        dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME);

      }

    });

    dbOpen.addEventListener('success', () => {

      const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readwrite').objectStore(DEFAULT_IDB_STORE_NAME);

      try {

        const request = store.add(value, index);

        request.addEventListener('success', () => {

          localStorageService.set(index, 'world').subscribe({
            next: () => {

              expect().nothing();

              dbOpen.result.close();

              done();

            },
            error: () => {

              dbOpen.result.close();

              /* Cases : Edge/IE because of `undefined` */
              pending();

            },

          });

        });

        request.addEventListener('error', () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

        });

      } catch {

        dbOpen.result.close();

        /* Cases : Edge/IE because of `null` */
        pending();

      }

    });

    dbOpen.addEventListener('error', () => {

      /* Cases : Firefox private mode where `indexedDb` exists but fails */
      pending();

    });

  } catch {

      /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
      pending();

  }

}

/**
 * Set a value with native `indexedDB` API and try to get it with the lib
 * @param localStorageService Service
 * @param done Jasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param value Value to set and get
 */
function testGetCompatibilityWithNativeAPI(localStorageService: StorageMap, done: DoneFn, value: any, schema?: JSONSchema) {

  try {

    const dbOpen = indexedDB.open(dbName);

    dbOpen.addEventListener('upgradeneeded', () => {

      if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

        /* Create the object store */
        dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME);

      }

    });

    dbOpen.addEventListener('success', () => {

      const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readwrite').objectStore(DEFAULT_IDB_STORE_NAME);

      try {

        const request = store.add(value, index);

        request.addEventListener('success', () => {

          // TODO: Investigate schema param not working without the test
          const request2 = schema ? localStorageService.get(index, schema) : localStorageService.get(index);

          request2.subscribe((result) => {

            /* Transform `null` to `undefined` to align with the lib behavior */
            expect(result).toEqual((value !== null) ? (value) : undefined);

            dbOpen.result.close();

            done();

          });

        });

        request.addEventListener('error', () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

        });

      } catch {

        dbOpen.result.close();

        /* Cases : Edge/IE because of `null` */
        pending();

      }

    });

    dbOpen.addEventListener('error', () => {

      /* Cases : Firefox private mode where `indexedDb` exists but fails */
      pending();

    });

  } catch {

    /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
    pending();

  }

}

describe('Interoperability', () => {

  let localStorageService: StorageMap;

  beforeAll(() => {
    localStorageService = new StorageMap(new IndexedDBDatabase(dbName));
  });

  beforeEach((done) => {
    /* Clear data to avoid tests overlap */
    clearStorage(done, localStorageService);
  });

  afterAll((done) => {
    /* Now that `indexedDB` store name can be customized, it's important:
     * - to delete the database after each tests group,
     * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
     * as it's where the store is created
     * - to be able to delete the database, all connections to it must be closed */
    closeAndDeleteDatabase(done, localStorageService);
  });

  const setTestValues = ['hello', '', 0, false, null, undefined];

  for (const setTestValue of setTestValues) {

    it(`setItem() after external API
      (will be pending in IE/Firefox private mode and 2 pending in Edge/IE because of null and undefined)`, (done) => {

      testSetCompatibilityWithNativeAPI(localStorageService, done, setTestValue);

    });

  }

  const getTestValues: [any, JSONSchema | undefined][] = [
    ['hello', { type: 'string' }],
    ['', { type: 'string' }],
    [0, { type: 'number' }],
    [1, { type: 'number' }],
    [true, { type: 'boolean' }],
    [false, { type: 'boolean' }],
    [[1, 2, 3], { type: 'array', items: { type: 'number' } }],
    [{ test: 'value' }, { type: 'object', properties: { test: { type: 'string' } } }],
    [null, undefined],
    [undefined, undefined],
  ];

  for (const [getTestValue, getTestSchema] of getTestValues) {

    it(`getItem() after external API
      (will be pending in IE/Firefox private mode and in Edge/IE because of null)`, (done) => {

      testGetCompatibilityWithNativeAPI(localStorageService, done, getTestValue, getTestSchema);

    });

  }

  it('keys() should return strings only (will be pending in IE/Firefox private mode)', (done) => {

    const key = 1;

    try {

      const dbOpen = indexedDB.open(dbName);

      dbOpen.addEventListener('upgradeneeded', () => {

        if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

          /* Create the object store */
          dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME);

        }

      });

      dbOpen.addEventListener('success', () => {

        const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readwrite').objectStore(DEFAULT_IDB_STORE_NAME);

        const request = store.add('test', key);

        request.addEventListener('success', () => {

          localStorageService.keys().subscribe({
            next: (keyItem) => {
              expect(typeof keyItem).toBe('string');
            },
            complete: () => {
              dbOpen.result.close();
              done();
            }
          });

        });

        request.addEventListener('error', () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

        });

      });

      dbOpen.addEventListener('error', () => {

        /* Cases : Firefox private mode where `indexedDb` exists but fails */
        pending();

      });

    } catch (error) {

        /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
        pending();

    }

  });

});
