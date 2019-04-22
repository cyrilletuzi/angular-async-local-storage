import { TestBed } from '@angular/core/testing';
import { from } from 'rxjs';
import { mergeMap, filter, tap } from 'rxjs/operators';

import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { LocalStorageDatabase } from './databases/localstorage-database';
import { MemoryDatabase } from './databases/memory-database';
import { JSONSchema } from './validation/json-schema';
import { VALIDATION_ERROR } from './exceptions';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8 } from './tokens';
import { clearStorage, closeAndDeleteDatabase } from './testing/cleaning';

function tests(description: string, localStorageServiceFactory: () => LocalStorage) {

  const key = 'test';
  let localStorageService: LocalStorage;

  describe(description, () => {

    beforeAll(() => {
      /* Via a factory as the class should be instancied only now, not before, otherwise tests could overlap */
      localStorageService = localStorageServiceFactory();
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

        localStorageService.setItem(key, 'test').pipe(
          mergeMap(() => localStorageService.setItem(key, null)),
          mergeMap(() => localStorageService.getItem(key)),
        ).subscribe((result) => {

          expect(result).toBeNull();

          done();

        });

      });

      it('undefined', (done) => {

        localStorageService.setItem(key, 'test').pipe(
          mergeMap(() => localStorageService.setItem(key, undefined)),
          mergeMap(() => localStorageService.getItem(key)),
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

      it('length', (done) => {

        localStorageService.length.pipe(
          tap((length) => { expect(length).toBe(0); }),
          mergeMap(() => localStorageService.setItem(key, 'test')),
          mergeMap(() => localStorageService.length),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => localStorageService.setItem('', 'test')),
          mergeMap(() => localStorageService.length),
          tap((length) => { expect(length).toBe(2); }),
          mergeMap(() => localStorageService.removeItem(key)),
          mergeMap(() => localStorageService.length),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => localStorageService.clear()),
          mergeMap(() => localStorageService.length),
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

      describe('API prior to v8', () => {

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

        localStorageService.setItem('index', 'value').subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('getItem()', (done) => {

        localStorageService.getItem(key).subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('removeItem()', (done) => {

        localStorageService.removeItem(key).subscribe({
          complete: () => {

            expect().nothing();

            done();
          }

        });

      });

      it('clear()', (done) => {

        localStorageService.clear().subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('size', (done) => {

        localStorageService.size.subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('length', (done) => {

        localStorageService.length.subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('keys()', (done) => {

        localStorageService.keys().subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('has()', (done) => {

        localStorageService.has(key).subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

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

  });

}

tests('memory', () => new LocalStorage(new MemoryDatabase()));

tests('localStorage', () => new LocalStorage(new LocalStorageDatabase()));

tests('localStorage with prefix', () => new LocalStorage(new LocalStorageDatabase(`ls`)));

tests('localStorage with old prefix', () => new LocalStorage(new LocalStorageDatabase(undefined, `old`)));

tests('indexedDB', () => new LocalStorage(new IndexedDBDatabase()));

tests('indexedDB with old prefix', () => new LocalStorage(new IndexedDBDatabase(undefined, undefined, `myapp${Date.now()}`)));

tests(
  'indexedDB with custom database and store names',
  () => new LocalStorage(new IndexedDBDatabase(`dbCustom${Date.now()}`, `storeCustom${Date.now()}`))
);

describe('specials', () => {

  /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
  it('check use of IndexedDb (will be pending in Firefox/IE private mode)', (done) => {

    const index = `test${Date.now()}`;
    const value = 'test';

    const localStorageService = new LocalStorage(new IndexedDBDatabase());

    localStorageService.setItem(index, value).subscribe(() => {

      try {

        const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME);

        dbOpen.addEventListener('success', () => {

          const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

          const request = store.get(index);

          request.addEventListener('success', () => {

            expect(request.result).toEqual(value);

            dbOpen.result.close();

            closeAndDeleteDatabase(done, localStorageService);

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

      } catch {

        /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
        pending();

      }

    });

  });

  it('indexedDB default store name (will be pending in Firefox private mode)', (done) => {

    const localStorageService = new LocalStorage(new IndexedDBDatabase());

    /* Do a request first as a first transaction is needed to set the store name */
    localStorageService.getItem('test').subscribe(() => {

      // tslint:disable-next-line: no-string-literal
      if (localStorageService['database'] instanceof IndexedDBDatabase) {

        // tslint:disable-next-line: no-string-literal
        expect(localStorageService['database']['storeName']).toBe(DEFAULT_IDB_STORE_NAME);

        closeAndDeleteDatabase(done, localStorageService);

      } else {

        /* Cases: Firefox private mode */
        pending();

      }

    });

  });

  it('indexedDB custom store name (will be pending in Firefox private mode)', (done) => {

    /* Unique names to be sure `indexedDB` `upgradeneeded` event is triggered */
    const dbName = `dbCustom${Date.now()}`;
    const storeName = `storeCustom${Date.now()}`;

    const localStorageService = new LocalStorage(new IndexedDBDatabase(dbName, storeName));

    /* Do a request first as a first transaction is needed to set the store name */
    localStorageService.getItem('test').subscribe(() => {

      // tslint:disable-next-line: no-string-literal
      if (localStorageService['database'] instanceof IndexedDBDatabase) {

        // tslint:disable-next-line: no-string-literal
        expect(localStorageService['database']['storeName']).toBe(storeName);

        closeAndDeleteDatabase(done, localStorageService);

      } else {

        /* Cases: Firefox private mode */
        pending();

      }

    });

  });

  it('indexedDB store prior to v8 (will be pending in Firefox/IE private mode)', (done) => {

    /* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
    const dbName = `ngStoreV7${Date.now()}`;

    const index1 = `test1${Date.now()}`;
    const value1 = 'test1';
    const index2 = `test2${Date.now()}`;
    const value2 = 'test2';

    try {

      const dbOpen = indexedDB.open(dbName);

      dbOpen.addEventListener('upgradeneeded', () => {

        // tslint:disable-next-line: deprecation
        if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8)) {

          /* Create the object store */
          // tslint:disable-next-line: deprecation
          dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

        }

      });

      dbOpen.addEventListener('success', () => {

        const localStorageService = new LocalStorage(new IndexedDBDatabase(dbName));

        // tslint:disable-next-line: deprecation
        const store1 = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8], 'readwrite')
          // tslint:disable-next-line: deprecation
          .objectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

        const request1 = store1.add({ value: value1 }, index1);

        request1.addEventListener('success', () => {

          localStorageService.getItem(index1).subscribe((result) => {

            /* Check detection of old store has gone well */
            // tslint:disable-next-line: deprecation no-string-literal
            expect((localStorageService['database'] as IndexedDBDatabase)['storeName']).toBe(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

            /* Via the lib, data should be unwrapped */
            expect(result).toBe(value1);

            localStorageService.setItem(index2, value2).subscribe(() => {

              // tslint:disable-next-line: deprecation
              const store2 = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8], 'readonly')
                // tslint:disable-next-line: deprecation
                .objectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

              const request2 = store2.get(index2);

              request2.addEventListener('success', () => {

                /* Via direct `indexedDB`, data should be wrapped */
                expect(request2.result).toEqual({ value: value2 });

                dbOpen.result.close();

                closeAndDeleteDatabase(done, localStorageService);

              });

              request2.addEventListener('error', () => {

                dbOpen.result.close();

                /* This case is not supposed to happen */
                fail();

              });

            });

          });

        });

        request1.addEventListener('error', () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

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

  it('indexedDB old prefix (will be pending in Firefox private mode)', (done) => {

    /* Unique name to be sure `indexedDB` `upgradeneeded` event is triggered */
    const prefix = `myapp${Date.now()}`;
    const localStorageService = new LocalStorage(new IndexedDBDatabase(undefined, undefined, prefix));

    /* Do a request first to allow localStorage fallback if needed */
    localStorageService.getItem('test').subscribe(() => {

      // tslint:disable-next-line: no-string-literal
      if (localStorageService['database'] instanceof IndexedDBDatabase) {

        // tslint:disable-next-line: no-string-literal
        expect(localStorageService['database']['dbName']).toBe(`${prefix}_${DEFAULT_IDB_DB_NAME}`);

        closeAndDeleteDatabase(done, localStorageService);

      } else {

        /* Cases: Firefox private mode */
        pending();

      }

    });

  });

  it('localStorage prefix', () => {

    const prefix = `ls_`;

    const localStorageService = new LocalStorage(new LocalStorageDatabase(prefix));

    // tslint:disable-next-line: no-string-literal
    expect((localStorageService['database'] as LocalStorageDatabase)['prefix']).toBe(prefix);

  });

  it('localStorage old prefix', () => {

    const prefix = `old`;

    const localStorageService = new LocalStorage(new LocalStorageDatabase(undefined, prefix));

    // tslint:disable-next-line: no-string-literal
    expect((localStorageService['database'] as LocalStorageDatabase)['prefix']).toBe(`${prefix}_`);

  });

  it('automatic storage injection', (done) => {

    // TODO: check new API types
    const localStorageService = TestBed.get<LocalStorage>(LocalStorage) as LocalStorage;

    const index = 'index';
    const value = `value${Date.now()}`;

    localStorageService.setItem(index, value).pipe(
      mergeMap(() => localStorageService.getItem(index))
    ).subscribe((data) => {

      expect(data).toBe(value);

      closeAndDeleteDatabase(done, localStorageService);

    });

  });

});
