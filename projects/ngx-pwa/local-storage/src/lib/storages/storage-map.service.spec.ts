import { mergeMap, tap, filter } from 'rxjs/operators';

import { StorageMap } from './storage-map.service';
import { VALIDATION_ERROR } from './exceptions';
import { IndexedDBDatabase, LocalStorageDatabase, MemoryDatabase } from '../databases';
import { JSONSchema } from '../validation';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_DB_VERSION } from '../tokens';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';

function tests(description: string, localStorageServiceFactory: () => StorageMap): void {

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

      it('blob (will be pending in Safari private)', (done) => {

        const value = new Blob();

        const observer = (localStorageService.backingEngine === 'localStorage') ?
          {
            next: () => {},
            error: () => {
              expect().nothing();
              done();
            }
          } : {
            next: (result: unknown) => {
              expect(result).toEqual(value);
              done();
            },
            error: () => {
              /* Safari in private mode doesn't allow to store `Blob` in `indexedDB` */
              pending();
              done();
            }
          };

        localStorageService.set(key, value).pipe(
          mergeMap(() => localStorageService.get(key))
        ).subscribe(observer);

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

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((data) => {

          expect(data).toEqual(value);

          done();

        });

      });

      it('invalid in get()', (done) => {

        localStorageService.set(key, 'test').pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('invalid in set()', (done) => {

        localStorageService.set(key, 'test', schema).pipe(
          mergeMap(() => localStorageService.get(key, { type: 'string' }))
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

    describe('watch()', () => {

      it('with valid schema', (done) => {

        const watchedKey = 'watched1';
        const values = [undefined, 'test1', undefined, 'test2', undefined];
        let i = 0;

        localStorageService.watch(watchedKey, { type: 'string' }).subscribe((result) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === 1) {

            localStorageService.set(watchedKey, values[1]).pipe(
              mergeMap(() => localStorageService.delete(watchedKey)),
              mergeMap(() => localStorageService.set(watchedKey, values[3])),
              mergeMap(() => localStorageService.clear()),
            ).subscribe();

          }

          if (i === values.length) {
            done();
          }

        });

      });

      it('with invalid schema', (done) => {

        const watchedKey = 'watched2';

        localStorageService.set(watchedKey, 'test').subscribe(() => {

          localStorageService.watch(watchedKey, { type: 'number' }).subscribe({
            error: () => {
              expect().nothing();
              done();
            }
          });

        });

      });

      it('without schema', (done) => {

        const watchedKey = 'watched3';
        const values = [undefined, 'test1', undefined, 'test2', undefined];
        let i = 0;

        localStorageService.watch(watchedKey).subscribe((result) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === 1) {

            localStorageService.set(watchedKey, values[1]).pipe(
              mergeMap(() => localStorageService.delete(watchedKey)),
              mergeMap(() => localStorageService.set(watchedKey, values[3])),
              mergeMap(() => localStorageService.clear()),
            ).subscribe();

          }

          if (i === values.length) {
            done();
          }

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

  tests('indexedDB', () => new StorageMap(new IndexedDBDatabase()));

  tests('indexedDB with no wrap', () => new StorageMap(new IndexedDBDatabase()));

  tests('indexedDB with custom options', () => new StorageMap(new IndexedDBDatabase('customDbTest', 'storeTest', 2)));

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

          const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION);

          dbOpen.addEventListener('success', () => {

            const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

            const request = store.get(index);

            request.addEventListener('success', () => {

              expect(request.result).toBe(value);

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

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('IndexedDb with noWrap to false (will be pending in Firefox/IE private mode)', (done) => {

      const index = `wrap${Date.now()}`;
      const value = 'test';

      const localStorageService = new StorageMap(new IndexedDBDatabase(undefined, undefined, undefined, false));

      localStorageService.set(index, value).subscribe(() => {

        try {

          const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION);

          dbOpen.addEventListener('success', () => {

            const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

            const request = store.get(index);

            request.addEventListener('success', () => {

              expect(request.result).toEqual({ value });

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

    it('indexedDB default options (will be pending in Firefox private mode)', (done) => {

      const localStorageService = new StorageMap(new IndexedDBDatabase());

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('test').subscribe(() => {

        if (localStorageService.backingEngine === 'indexedDB') {

          const { database, store, version } = localStorageService.backingStore;

          expect(database).toBe(DEFAULT_IDB_DB_NAME);
          expect(store).toBe(DEFAULT_IDB_STORE_NAME);
          expect(version).toBe(DEFAULT_IDB_DB_VERSION);

          closeAndDeleteDatabase(done, localStorageService);

        } else {

          /* Cases: Firefox private mode */
          pending();

        }

      });

    });

    it('indexedDB custom options (will be pending in Firefox private mode)', (done) => {

      /* Unique names to be sure `indexedDB` `upgradeneeded` event is triggered */
      const dbName = `dbCustom${Date.now()}`;
      const storeName = `storeCustom${Date.now()}`;
      const dbVersion = 2;

      const localStorageService = new StorageMap(new IndexedDBDatabase(dbName, storeName, dbVersion));

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('test').subscribe(() => {

        if (localStorageService.backingEngine === 'indexedDB') {

          const { database, store, version } = localStorageService.backingStore;

          expect(database).toBe(dbName);
          expect(store).toBe(storeName);
          expect(version).toBe(dbVersion);

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
      expect(localStorageService.fallbackBackingStore.prefix).toBe(prefix);

    });

  });

});
