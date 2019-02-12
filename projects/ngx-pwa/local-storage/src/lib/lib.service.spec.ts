import { TestBed } from '@angular/core/testing';
import { from } from 'rxjs';
import { mergeMap, filter, tap } from 'rxjs/operators';

import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { LocalStorageDatabase } from './databases/localstorage-database';
import { MemoryDatabase } from './databases/memory-database';
import { JSONSchema } from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';
import { VALIDATION_ERROR } from './exceptions';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8 } from './tokens';
import { clearIndexedDB } from './testing/indexeddb';

function tests(localStorageService: LocalStorage) {

  const key = 'test';

  describe(('setItem() + getItem()'), () => {

    it('unexisting key', (done) => {

      localStorageService.getItem(`unknown${Date.now()}`).subscribe((data) => {

        expect(data).toBeNull();

        done();

      });

    });

    it('string', (done) => {

      const value = 'blue';

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('empty string', (done) => {

      const value = '';

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('integer', (done) => {

      const value = 1;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('number', (done) => {

      const value = 1.5;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('zero', (done) => {

      const value = 0;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('true', (done) => {

      const value = true;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('false', (done) => {

      const value = false;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('null', (done) => {

      const value = null;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBeNull();

        done();

      });

    });

    it('undefined', (done) => {

      const value = undefined;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBeNull();

        done();

      });

    });

    it('array', (done) => {

      const value = [1, 2, 3];

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toEqual(value);

        done();

      });

    });

    it('object', (done) => {

      const value = { name: 'test' };

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toEqual(value);

        done();

      });

    });

    it('update', (done) => {

      localStorageService.setItem(key, 'value').pipe(
        mergeMap(() => localStorageService.setItem(key, 'updated'))
      ).subscribe(() => {

          expect().nothing();

          done();

        });

    });

    it('concurrency', (done) => {

      const value1 = 'test1';
      const value2 = 'test2';

      expect(() => {

        localStorageService.setItem(key, value1).subscribe();

        localStorageService.setItem(key, value2).pipe(
          mergeMap(() => localStorageService.getItem(key))
        ).subscribe((result) => {

          expect(result).toBe(value2);

          done();

        });

      }).not.toThrow();

    });

  });

  describe('removeItem()', () => {

    it('existing key', (done) => {

      localStorageService.setItem(key, 'test').pipe(
        mergeMap(() => localStorageService.removeItem(key)),
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBeNull();

        done();

      });

    });

    it('unexisting key', (done) => {

      localStorageService.removeItem(`unexisting${Date.now()}`).subscribe(() => {

          expect().nothing();

          done();

      });

    });

  });

  describe('Map-like API', () => {

    it('size', (done) => {

      localStorageService.size.pipe(
        tap((length) => { expect(length).toBe(0); }),
        mergeMap(() => localStorageService.setItem(key, 'test')),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(1); }),
        mergeMap(() => localStorageService.setItem('', 'test')),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(2); }),
        mergeMap(() => localStorageService.removeItem(key)),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(1); }),
        mergeMap(() => localStorageService.clear()),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(0); }),
      ).subscribe(() => {
        done();
      });

    });

    it('keys()', (done) => {

      const key1 = 'index1';
      const key2 = 'index2';

      localStorageService.setItem(key1, 'test').pipe(
        mergeMap(() => localStorageService.setItem(key2, 'test')),
        mergeMap(() => localStorageService.keys()),
      ).subscribe((keys) => {

        /* Sorting because keys order is not standard in `localStorage` (in Firefox especially) */
        expect([key1, key2].sort()).toEqual(keys.sort());

        done();

      });

    });

    it('getKey() when no items', (done) => {

      localStorageService.keys().subscribe((keys) => {

        expect(keys.length).toBe(0);

        done();

      });

    });

    it('key() on existing', (done) => {

      localStorageService.setItem(key, 'test').pipe(
        mergeMap(() => localStorageService.has(key))
      ).subscribe((result) => {

        expect(result).toBe(true);

        done();

      });

    });

    it('key() on unexisting', (done) => {

      localStorageService.has(`nokey${Date.now()}`).subscribe((result) => {

        expect(result).toBe(false);

        done();

      });

    });

    it('advanced case: remove only some items', (done) => {

      localStorageService.setItem('user_firstname', 'test').pipe(
        mergeMap(() => localStorageService.setItem('user_lastname', 'test')),
        mergeMap(() => localStorageService.setItem('app_data1', 'test')),
        mergeMap(() => localStorageService.setItem('app_data2', 'test')),
        mergeMap(() => localStorageService.keys()),
        /* Now we will have an `Observable` emiting multiple values */
        mergeMap((keys) => from(keys)),
        filter((currentKey) => currentKey.startsWith('app_')),
        mergeMap((currentKey) => localStorageService.removeItem(currentKey)),
      ).subscribe({
        /* So we need to wait for completion of all actions to check */
        complete: () => {

        localStorageService.size.subscribe((size) => {

          expect(size).toBe(2);

          done();

        });

        }
      });

    });

  });

  describe('JSON schema', () => {

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    describe('API v8', () => {

      it('valid', (done) => {

        const value = { expected: 'value' };

        localStorageService.setItem(key, value).pipe(
          mergeMap(() => localStorageService.getItem(key, schema))
        ).subscribe((data) => {

          expect(data).toEqual(value);

          done();

        });

      });

      it('invalid', (done) => {

        localStorageService.setItem(key, 'test').pipe(
          mergeMap(() => localStorageService.getItem(key, schema))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

            done();

        } });

      });

      it('null: no validation', (done) => {

        localStorageService.getItem<{ expected: string }>(`noassociateddata${Date.now()}`, schema).subscribe(() => {

          expect().nothing();

          done();

        });

      });

    });

    describe('API v7', () => {

      it('valid', (done) => {

        const value = { expected: 'value' };

        localStorageService.setItem(key, value).pipe(
          mergeMap(() => localStorageService.getItem(key, { schema }))
        ).subscribe((data) => {

          expect(data).toEqual(value);

          done();

        });

      });

      it('invalid', (done) => {

        localStorageService.setItem(key, 'test').pipe(
          mergeMap(() => localStorageService.getItem(key, { schema }))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

            done();

        } });

      });

      it('null: no validation', (done) => {

        localStorageService.getItem<{ expected: string }>(`noassociateddata${Date.now()}`, { schema }).subscribe(() => {

          expect().nothing();

          done();

        });

      });

    });

  });

  /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
   * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
  describe('complete', () => {

    it('setItem()', (done) => {

      localStorageService.setItem('index', 'value').subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('getItem()', (done) => {

      localStorageService.getItem(key).subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('removeItem()', (done) => {

      localStorageService.removeItem(key).subscribe({ complete: () => {

        expect().nothing();

        done(); }

      });

    });

    it('clear()', (done) => {

      localStorageService.clear().subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('size', (done) => {

      localStorageService.size.subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('keys()', (done) => {

      localStorageService.keys().subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('has()', (done) => {

      localStorageService.has(key).subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

  });

  describe('compatibility', () => {

    it('Promise', (done) => {

      const value = 'test';

      localStorageService.setItem(key, value).toPromise()
        .then(() => localStorageService.getItem(key).toPromise())
        .then((result) => {
          expect(result).toBe(value);
          done();
        });

    });

    it('async / await', async () => {

      const value = 'test';

      await localStorageService.setItem(key, value).toPromise();

      const result = await localStorageService.getItem(key).toPromise();

      expect(result).toBe(value);

    });

  });

  describe('auto-subscribe', () => {

    it('setItemSubscribe()', (done) => {

      const value = 'test';

      localStorageService.setItemSubscribe(key, value);

      setTimeout(() => {

        localStorageService.getItem(key).subscribe((data) => {
          expect(data).toBe(value);
          done();
        });

      }, 50);

    });

    it('removeItemSubscribe()', (done) => {

      const value = 'test';

      localStorageService.setItem(key, value).subscribe(() => {

        localStorageService.removeItemSubscribe(key);

        setTimeout(() => {

          localStorageService.getItem(key).subscribe((data) => {
            expect(data).toBeNull();
            done();
          });

        }, 50);

      });

    });

    it('clearSubscribe()', (done) => {

      const value = 'test';

      localStorageService.setItem(key, value).subscribe(() => {

        localStorageService.clearSubscribe();

        setTimeout(() => {

          localStorageService.getItem(key).subscribe((data) => {
            expect(data).toBe(null);
            done();
          });

        }, 50);

      });

    });

  });

}

describe('Memory', () => {

  const localStorageService = new LocalStorage(new MemoryDatabase(), new JSONValidator());

  beforeEach((done) => {
    localStorageService.clear().subscribe(() => {
      done();
    });
  });

  tests(localStorageService);

});

describe('localStorage', () => {

  const localStorageService = new LocalStorage(new LocalStorageDatabase(), new JSONValidator());

  beforeEach(() => {
    localStorage.clear();
  });

  tests(localStorageService);

});

describe('IndexedDB', () => {

  const indexedDBService = new IndexedDBDatabase();
  const localStorageService = new LocalStorage(indexedDBService, new JSONValidator());

  beforeEach((done) => {

    /* Clear `localStorage` for some browsers private mode which fallbacks to `localStorage` */
    localStorage.clear();

    clearIndexedDB(done);

  });

  tests(localStorageService);

  /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
  it('check use of IndexedDb (will be pending in Firefox/IE private mode)', (done) => {

    const index = `test${Date.now()}`;
    const value = 'test';

    localStorageService.setItem(index, value).subscribe(() => {

      try {

        const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME);

        dbOpen.addEventListener('success', () => {

          const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

          const request = store.get(index);

          request.addEventListener('success', () => {

            expect(request.result).toEqual(value);

            done();

          });

        });

        dbOpen.addEventListener('error', () => {

          /* Cases : Firefox private mode where `indexedDb` exists but fails */
          pending();

        });

      } catch {

        /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
        pending();

      }

    });

  });

  it('check store name', (done) => {

    localStorageService.getItem('test').subscribe(() => {

      expect(indexedDBService['storeName']).toBe(DEFAULT_IDB_STORE_NAME);

      done();

    });

  });

  // it('should recreate the store if deleted', (done) => {

  //   /* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
  //   const dbName = `deleteDB${Date.now()}`;

  //   const indexedDBServiceDelete = new IndexedDBDatabase(undefined, dbName);

  //   const localStorageServiceDelete = new LocalStorage(indexedDBServiceDelete, new JSONValidator());

  //   try {

  //     const dbOpen = indexedDB.open(dbName, 2);

  //     dbOpen.addEventListener('upgradeneeded', () => {

  //       if (dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

  //         dbOpen.result.deleteObjectStore(DEFAULT_IDB_STORE_NAME);

  //       }

  //     });

  //     dbOpen.addEventListener('success', () => {

  //       localStorageServiceDelete.setItem('test', () => {

  //         expect().nothing();

  //         done();

  //       });

  //     });

  //     dbOpen.addEventListener('error', () => {

  //       /* Cases : Firefox private mode where `indexedDb` exists but fails */
  //       pending();

  //     });


  //   } catch {

  //     /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
  //     pending();

  //   }



  // });

});

describe('IndexedDB with store prior to v7', () => {

  /* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
  const dbName = `ngStore${Date.now()}`;

  it('(will be pending in Firefox/IE private mode)', (done) => {

    const index1 = `test1${Date.now()}`;
    const value1 = 'test1';
    const index2 = `test2${Date.now()}`;
    const value2 = 'test2';

    try {

      const dbOpen = indexedDB.open(dbName);

      dbOpen.addEventListener('upgradeneeded', () => {

        if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8)) {

          /* Create the object store */
          dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

        }

      });

      dbOpen.addEventListener('success', () => {

        const indexedDBService = new IndexedDBDatabase(undefined, dbName);

        const localStorageService = new LocalStorage(indexedDBService, new JSONValidator());

        const store1 = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8], 'readwrite')
          .objectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

        const request1 = store1.add({ value: value1 }, index1);

        request1.addEventListener('success', () => {

          localStorageService.getItem(index1).subscribe((result) => {

            /* Check detection of old store has gone well */
            expect(indexedDBService['storeName']).toBe(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

            /* Via the lib, data should be unwrapped */
            expect(result).toBe(value1);

            localStorageService.setItem(index2, value2).subscribe(() => {

              const store2 = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8], 'readonly')
                .objectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

              const request2 = store2.get(index2);

              request2.addEventListener('success', () => {

                /* Via direct `indexedDB`, data should be wrapped */
                expect(request2.result).toEqual({ value: value2 });

                done();

              });

            });

          });

        });

      });

      dbOpen.addEventListener('error', () => {

        /* Cases : Firefox private mode where `indexedDb` exists but fails */
        pending();

      });

    } catch {

      /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
      pending();

    }

  });

});

describe('IndexedDB and a prefix', () => {

  /* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
  const prefix = `myapp${Date.now()}`;

  it('check prefix', () => {

    const indexedDBService = new IndexedDBDatabase(prefix);

    expect(indexedDBService['dbName']).toBe(`${prefix}_${DEFAULT_IDB_DB_NAME}`);

  });

  it('check prefix with custom database name', () => {

    /* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
    const dbName = `customDb${Date.now()}`;

    const indexedDBService = new IndexedDBDatabase(prefix, dbName);

    expect(indexedDBService['dbName']).toBe(`${prefix}_${dbName}`);

  });

  const localStorageService = new LocalStorage(new IndexedDBDatabase(prefix), new JSONValidator());

  beforeEach((done) => {

    /* Clear `localStorage` for some browsers private mode which fallbacks to `localStorage` */
    localStorage.clear();

    clearIndexedDB(done, `${prefix}_${DEFAULT_IDB_DB_NAME}`);

  });

  tests(localStorageService);

});

describe('IndexedDB with custom database and store names', () => {

  /* Unique names to be sure `indexedDB` `upgradeneeded` event is triggered */
  const dbName = `dbCustom${Date.now()}`;
  const storeName = `storeCustom${Date.now()}`;

  const indexedDBService = new IndexedDBDatabase(undefined, dbName, storeName);
  const localStorageService = new LocalStorage(indexedDBService, new JSONValidator());

  beforeEach((done) => {

    /* Clear `localStorage` for some browsers private mode which fallbacks to `localStorage` */
    localStorage.clear();

    clearIndexedDB(done, dbName, storeName);

  });

  it('check store name', (done) => {

    localStorageService.getItem('test').subscribe(() => {

      expect(indexedDBService['storeName']).toBe(storeName);

      done();

    });

  });

  tests(localStorageService);

});

describe('Automatic storage injection', () => {

  it('valid', (done) => {

    const localStorageService = TestBed.get(LocalStorage) as LocalStorage;

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).pipe(
      mergeMap(() => localStorageService.getItem(index))
    ).subscribe((data) => {
      expect(data).toBe(value);
      done();
    });

  });

});
