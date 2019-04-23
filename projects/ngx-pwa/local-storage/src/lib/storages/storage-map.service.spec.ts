import { TestBed } from '@angular/core/testing';
import { mergeMap, tap, filter } from 'rxjs/operators';

import { StorageMap } from './storage-map.service';
import { IndexedDBDatabase, LocalStorageDatabase, MemoryDatabase } from '../databases';
import { JSONSchema, VALIDATION_ERROR } from '../validation';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8 } from '../tokens';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';

function tests(description: string, localStorageServiceFactory: () => StorageMap) {

  const key = 'test';
  let localStorageService: StorageMap;

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

    describe(('set() + get()'), () => {

      it('unexisting key', (done) => {

        localStorageService.get(`unknown${Date.now()}`).subscribe((data) => {

          expect(data).toBeUndefined();

          done();

        });

      });

      it('string', (done) => {

        const value = 'blue';

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('empty string', (done) => {

        const value = '';

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer', (done) => {

        const value = 1;

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number', (done) => {

        const value = 1.5;

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('zero', (done) => {

        const value = 0;

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('true', (done) => {

        const value = true;

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('false', (done) => {

        const value = false;

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('null', (done) => {

        localStorageService.set(key, 'test').pipe(
          mergeMap(() => localStorageService.set(key, null)),
          mergeMap(() => localStorageService.get(key)),
        ).subscribe((result) => {

          // TODO: see if `null` can be stored in IE/Edge
          expect(result).toBeUndefined();

          done();

        });

      });

      it('undefined', (done) => {

        localStorageService.set(key, 'test').pipe(
          mergeMap(() => localStorageService.set(key, undefined)),
          mergeMap(() => localStorageService.get(key)),
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('array', (done) => {

        const value = [1, 2, 3];

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('object', (done) => {

        const value = { name: 'test' };

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('update', (done) => {

        localStorageService.set(key, 'value').pipe(
          mergeMap(() => localStorageService.set(key, 'updated'))
        ).subscribe(() => {

            expect().nothing();

            done();

          });

      });

      it('concurrency', (done) => {

        const value1 = 'test1';
        const value2 = 'test2';

        expect(() => {

          localStorageService.set(key, value1).subscribe();

          localStorageService.set(key, value2).pipe(
            mergeMap(() => localStorageService.get(key))
          ).subscribe((result) => {

            expect(result).toBe(value2);

            done();

          });

        }).not.toThrow();

      });

    });

    describe('delete()', () => {

      it('existing key', (done) => {

        localStorageService.set(key, 'test').pipe(
          mergeMap(() => localStorageService.delete(key)),
          mergeMap(() => localStorageService.get(key))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('unexisting key', (done) => {

        localStorageService.delete(`unexisting${Date.now()}`).subscribe(() => {

            expect().nothing();

            done();

        });

      });

    });

    describe('Map-like API', () => {

      it('size', (done) => {

        localStorageService.size.pipe(
          tap((length) => { expect(length).toBe(0); }),
          mergeMap(() => localStorageService.set(key, 'test')),
          mergeMap(() => localStorageService.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => localStorageService.set('', 'test')),
          mergeMap(() => localStorageService.size),
          tap((length) => { expect(length).toBe(2); }),
          mergeMap(() => localStorageService.delete(key)),
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
        const keys = [key1, key2];

        localStorageService.set(key1, 'test').pipe(
          mergeMap(() => localStorageService.set(key2, 'test')),
          mergeMap(() => localStorageService.keys()),
        ).subscribe({
          next: (value) => {
            expect(keys).toContain(value);
            keys.splice(keys.indexOf(value), 1);
          },
          complete: () => {
            done();
          },
          error: () => {
            done();
          },
        });

      });

      it('getKey() when no items', (done) => {

        localStorageService.keys().subscribe({
          next: () => {
            fail();
          },
          complete: () => {
            expect().nothing();
            done();
          },
        });

      });

      it('has() on existing', (done) => {

        localStorageService.set(key, 'test').pipe(
          mergeMap(() => localStorageService.has(key))
        ).subscribe((result) => {

          expect(result).toBe(true);

          done();

        });

      });

      it('has() on unexisting', (done) => {

        localStorageService.has(`nokey${Date.now()}`).subscribe((result) => {

          expect(result).toBe(false);

          done();

        });

      });

      it('advanced case: remove only some items', (done) => {

        localStorageService.set('user_firstname', 'test').pipe(
          mergeMap(() => localStorageService.set('user_lastname', 'test')),
          mergeMap(() => localStorageService.set('app_data1', 'test')),
          mergeMap(() => localStorageService.set('app_data2', 'test')),
          mergeMap(() => localStorageService.keys()),
          filter((currentKey) => currentKey.startsWith('app_')),
          mergeMap((currentKey) => localStorageService.delete(currentKey)),
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

      it('valid', (done) => {

        const value = { expected: 'value' };

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((data) => {

          expect(data).toEqual(value);

          done();

        });

      });

      it('invalid', (done) => {

        localStorageService.set(key, 'test').pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('null: no validation', (done) => {

        localStorageService.get<{ expected: string }>(`noassociateddata${Date.now()}`, schema).subscribe(() => {

          expect().nothing();

          done();

        });

      });

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
    * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe('complete', () => {

      it('set()', (done) => {

        localStorageService.set('index', 'value').subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('get()', (done) => {

        localStorageService.get(key).subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('delete()', (done) => {

        localStorageService.delete(key).subscribe({
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

        localStorageService.set(key, value).toPromise()
          .then(() => localStorageService.get(key).toPromise())
          .then((result) => {
            expect(result).toBe(value);
            done();
          });

      });

      it('async / await', async () => {

        const value = 'test';

        await localStorageService.set(key, value).toPromise();

        const result = await localStorageService.get(key).toPromise();

        expect(result).toBe(value);

      });

    });

  });

}

describe('StorageMap', () => {

  tests('memory', () => new StorageMap(new MemoryDatabase()));

  tests('localStorage', () => new StorageMap(new LocalStorageDatabase()));

  tests('localStorage with prefix', () => new StorageMap(new LocalStorageDatabase(`ls`)));

  tests('localStorage with old prefix', () => new StorageMap(new LocalStorageDatabase(undefined, `old`)));

  tests('indexedDB', () => new StorageMap(new IndexedDBDatabase()));

  tests('indexedDB with old prefix', () => new StorageMap(new IndexedDBDatabase(undefined, undefined, `myapp${Date.now()}`)));

  tests(
    'indexedDB with custom database and store names',
    () => new StorageMap(new IndexedDBDatabase(`dbCustom${Date.now()}`, `storeCustom${Date.now()}`))
  );

  describe('specials', () => {

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('check use of IndexedDb (will be pending in Firefox/IE private mode)', (done) => {

      const index = `test${Date.now()}`;
      const value = 'test';

      const localStorageService = new StorageMap(new IndexedDBDatabase());

      localStorageService.set(index, value).subscribe(() => {

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

      const localStorageService = new StorageMap(new IndexedDBDatabase());

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('test').subscribe(() => {

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

      const localStorageService = new StorageMap(new IndexedDBDatabase(dbName, storeName));

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('test').subscribe(() => {

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

          const localStorageService = new StorageMap(new IndexedDBDatabase(dbName));

          // tslint:disable-next-line: deprecation
          const store1 = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8], 'readwrite')
            // tslint:disable-next-line: deprecation
            .objectStore(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

          const request1 = store1.add({ value: value1 }, index1);

          request1.addEventListener('success', () => {

            localStorageService.get(index1).subscribe((result) => {

              /* Check detection of old store has gone well */
              // tslint:disable-next-line: deprecation no-string-literal
              expect((localStorageService['database'] as IndexedDBDatabase)['storeName']).toBe(DEFAULT_IDB_STORE_NAME_PRIOR_TO_V8);

              /* Via the lib, data should be unwrapped */
              expect(result).toBe(value1);

              localStorageService.set(index2, value2).subscribe(() => {

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
      const localStorageService = new StorageMap(new IndexedDBDatabase(undefined, undefined, prefix));

      /* Do a request first to allow localStorage fallback if needed */
      localStorageService.get('test').subscribe(() => {

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

      const localStorageService = new StorageMap(new LocalStorageDatabase(prefix));

      // tslint:disable-next-line: no-string-literal
      expect((localStorageService['database'] as LocalStorageDatabase)['prefix']).toBe(prefix);

    });

    it('localStorage old prefix', () => {

      const prefix = `old`;

      const localStorageService = new StorageMap(new LocalStorageDatabase(undefined, prefix));

      // tslint:disable-next-line: no-string-literal
      expect((localStorageService['database'] as LocalStorageDatabase)['prefix']).toBe(`${prefix}_`);

    });

    it('automatic storage injection', (done) => {

      // TODO: check new API types  and backward compitiliby with v7
      // tslint:disable-next-line: deprecation
      const localStorageService = TestBed.get(StorageMap) as StorageMap;

      const index = 'index';
      const value = `value${Date.now()}`;

      localStorageService.set(index, value).pipe(
        mergeMap(() => localStorageService.get(index))
      ).subscribe((data) => {

        expect(data).toBe(value);

        closeAndDeleteDatabase(done, localStorageService);

      });

    });

  });

});
