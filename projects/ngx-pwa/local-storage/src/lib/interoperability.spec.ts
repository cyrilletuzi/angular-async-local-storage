import { clearIndexedDB } from './testing/indexeddb';
import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { JSONValidator } from './validation/json-validator';
import { JSONSchema } from './validation/json-schema';
import { DEFAULT_IDB_STORE_NAME } from './tokens';

/* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
const dbName = `interopStore${Date.now()}`;

function testSetCompatibilityWithNativeAPI(localStorageService: LocalStorage, done: DoneFn, value: any) {

  const index = 'test';

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

        store.add(value, index).addEventListener('success', () => {

          localStorageService.setItem(index, 'world').subscribe(() => {

            expect().nothing();

            done();

          }, () => {

            /* Cases : Edge/IE because of `undefined` */
            pending();

          });

        });

      } catch {

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

function testGetCompatibilityWithNativeAPI(localStorageService: LocalStorage, done: DoneFn, value: any, schema?: JSONSchema) {

  const index = 'test';

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

        store.add(value, index).addEventListener('success', () => {

          const request = schema ? localStorageService.getItem(index, schema) : localStorageService.getItem(index);

          request.subscribe((result) => {

            expect(result).toEqual((value !== undefined) ? value : null);

            done();

          });

        });

      } catch {

        /* Cases : Edge/IE because of `null` */
        pending();

      }

    });

    dbOpen.addEventListener('error', () => {

      /* Cases : Firefox private mode where `indexedDb` exists but fails */
      pending();

    });

  } catch (error) {

      /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
      pending();

  }

}

describe('Interoperability', () => {

  const localStorageService = new LocalStorage(new IndexedDBDatabase(undefined, dbName), new JSONValidator());

  beforeEach((done) => {
    clearIndexedDB(done, dbName);
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
  ];

  for (const [getTestValue, getTestSchema] of getTestValues) {

    it(`getItem() after external API
      (will be pending in IE/Firefox private mode)`, (done) => {

      testGetCompatibilityWithNativeAPI(localStorageService, done, getTestValue, getTestSchema);

    });

  }

  it(`getItem() on null after external API
  (will be pending in IE/Firefox private mode and in Edge/IE)`, (done) => {

    testGetCompatibilityWithNativeAPI(localStorageService, done, null);

  });

  it(`getItem() on undefined null after external API
  (will be pending in IE/Firefox private mode)`, (done) => {

    testGetCompatibilityWithNativeAPI(localStorageService, done, undefined);

  });

  it('keys() should return strings only', (done) => {

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

        store.add('test', key).addEventListener('success', () => {

          localStorageService.keys().subscribe((keys) => {
            for (const keyItem of keys) {
              expect(typeof keyItem).toBe('string');
            }
            done();
          });

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
