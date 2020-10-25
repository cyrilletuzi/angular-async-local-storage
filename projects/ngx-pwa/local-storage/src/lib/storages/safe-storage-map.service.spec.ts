import { mergeMap, tap, filter } from 'rxjs/operators';

import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { MemoryDatabase } from '../databases/memory-database';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_DB_VERSION } from '../tokens';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';
import { SafeStorageMap } from './safe-storage-map.service';
import { VALIDATION_ERROR } from './exceptions';

function tests(description: string, localStorageServiceFactory: () => SafeStorageMap): void {

  const key = 'test';
  let localStorageService: SafeStorageMap;

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

        const schema = { type: 'string' } as const;

        localStorageService.get(`unknown${Date.now()}`, schema).subscribe((data) => {

          expect(data).toBeUndefined();

          done();

        });

      });

      it('string', (done) => {

        const value = 'blue';
        const schema = { type: 'string' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('empty string', (done) => {

        const value = '';
        const schema = { type: 'string' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer', (done) => {

        const value = 1;
        const schema = { type: 'integer' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number', (done) => {

        const value = 1.5;
        const schema = { type: 'number' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('zero', (done) => {

        const value = 0;
        const schema = { type: 'number' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('true', (done) => {

        const value = true;
        const schema = { type: 'boolean' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('false', (done) => {

        const value = false;
        const schema = { type: 'boolean' } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('null', (done) => {

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'test', schema).pipe(
          mergeMap(() => localStorageService.set(key, null, schema)),
          mergeMap(() => localStorageService.get(key, schema)),
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('undefined', (done) => {

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'test', schema).pipe(
          mergeMap(() => localStorageService.set(key, undefined, schema)),
          mergeMap(() => localStorageService.get(key, schema)),
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('array', (done) => {

        const value = [1, 2, 3];
        const schema = {
          type: 'array',
          items: { type: 'number' }
        } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('object', (done) => {

        const value = { name: 'test' };
        const schema = {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name']
        } as const;

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toEqual(value);

          done();

        });

      });

      // TODO: add blob type in JSON schema?
      it('blob (will be pending in Safari private)', (done) => {

        const value = new Blob();
        const schema = { type: 'unknown' } as const;

        const observer = (localStorageService.backingEngine === 'localStorage') ?
          {
            next: () => {},
            error: () => {
              expect().nothing();
              done();
            }
          } : {
            next: (result: unknown | undefined) => {
              expect(result).toEqual(value);
              done();
            },
            error: () => {
              /* Safari in private mode doesn't allow to store `Blob` in `indexedDB` */
              pending();
              done();
            }
          };

        localStorageService.set(key, value, schema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe(observer);

      });

      it('update', (done) => {

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'value', schema).pipe(
          mergeMap(() => localStorageService.set(key, 'updated', schema))
        ).subscribe(() => {

            expect().nothing();

            done();

          });

      });

      it('concurrency', (done) => {

        const value1 = 'test1';
        const value2 = 'test2';
        const schema = { type: 'string' } as const;

        expect(() => {

          localStorageService.set(key, value1, schema).subscribe();

          localStorageService.set(key, value2, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result) => {

            expect(result).toBe(value2);

            done();

          });

        }).not.toThrow();

      });

    });

    describe('delete()', () => {

      it('existing key', (done) => {

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'test', schema).pipe(
          mergeMap(() => localStorageService.delete(key)),
          mergeMap(() => localStorageService.get(key, schema))
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

        const schema = { type: 'string' } as const;

        localStorageService.size.pipe(
          tap((length) => { expect(length).toBe(0); }),
          mergeMap(() => localStorageService.set(key, 'test', schema)),
          mergeMap(() => localStorageService.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => localStorageService.set('', 'test', schema)),
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
        const schema = { type: 'string' } as const;

        localStorageService.set(key1, 'test', schema).pipe(
          mergeMap(() => localStorageService.set(key2, 'test', schema)),
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

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'test', schema).pipe(
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

        const schema = { type: 'string' } as const;

        localStorageService.set('user_firstname', 'test', schema).pipe(
          mergeMap(() => localStorageService.set('user_lastname', 'test', schema)),
          mergeMap(() => localStorageService.set('app_data1', 'test', schema)),
          mergeMap(() => localStorageService.set('app_data2', 'test', schema)),
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

      const schema = {
        type: 'object',
        properties: {
          expected: {
            type: 'string'
          }
        },
        required: ['expected']
      } as const;

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

        const unmatchedSchema = { type: 'string' } as const;

        localStorageService.set(key, 'test', unmatchedSchema).pipe(
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('invalid in set()', (done) => {

        // @ts-expect-error
        localStorageService.set(key, 'test', schema).subscribe(() => {

          expect().nothing();

          done();

        });

      });

      it('null: no validation', (done) => {

        localStorageService.get(`noassociateddata${Date.now()}`, schema).subscribe(() => {

          expect().nothing();

          done();

        });

      });

    });

    describe('watch()', () => {

      it('with valid schema', (done) => {

        const watchedKey = 'watched1';
        const values = [undefined, 'test1', undefined, 'test2', undefined];
        const schema = { type: 'string' } as const;
        let i = 0;

        localStorageService.watch(watchedKey, schema).subscribe((result: string | undefined) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === 1) {

            localStorageService.set(watchedKey, values[1], schema).pipe(
              mergeMap(() => localStorageService.delete(watchedKey)),
              mergeMap(() => localStorageService.set(watchedKey, values[3], schema)),
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

        localStorageService.set(watchedKey, 'test', { type: 'string' } as const).subscribe(() => {

          localStorageService.watch(watchedKey, { type: 'number' } as const).subscribe({
            error: () => {
              expect().nothing();
              done();
            }
          });

        });

      });

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
    * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe('complete', () => {

      const schema = { type: 'string' } as const;

      it('set()', (done) => {

        localStorageService.set('index', 'value', schema).subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('get()', (done) => {

        localStorageService.get(key, schema).subscribe({
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

      const schema = { type: 'string' } as const;

      it('Promise', (done) => {

        const value = 'test';

        localStorageService.set(key, value, schema).toPromise()
          .then(() => localStorageService.get(key, schema).toPromise())
          .then((result) => {
            expect(result).toBe(value);
            done();
          });

      });

      it('async / await', async () => {

        const value = 'test';

        await localStorageService.set(key, value, schema).toPromise();

        const result = await localStorageService.get(key, schema).toPromise();

        expect(result).toBe(value);

      });

    });

  });

}

describe('StorageMap', () => {

  tests('memory', () => new SafeStorageMap(new MemoryDatabase()));

  tests('localStorage', () => new SafeStorageMap(new LocalStorageDatabase()));

  tests('localStorage with prefix', () => new SafeStorageMap(new LocalStorageDatabase(`ls`)));

  tests('indexedDB', () => new SafeStorageMap(new IndexedDBDatabase()));

  tests('indexedDB with no wrap', () => new SafeStorageMap(new IndexedDBDatabase()));

  tests('indexedDB with custom options', () => new SafeStorageMap(new IndexedDBDatabase('customDbTest', 'storeTest', 2)));

  tests(
    'indexedDB with custom database and store names',
    () => new SafeStorageMap(new IndexedDBDatabase(`dbCustom${Date.now()}`, `storeCustom${Date.now()}`))
  );

  describe('specials', () => {

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('check use of IndexedDb (will be pending in Firefox/IE private mode)', (done) => {

      const index = `test${Date.now()}`;
      const value = 'test';
      const schema = { type: 'string' } as const;

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase());

      localStorageService.set(index, value, schema).subscribe(() => {

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
      const schema = { type: 'string' } as const;

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(undefined, undefined, undefined, false));

      localStorageService.set(index, value, schema).subscribe(() => {

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

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase());
      const schema = { type: 'string' } as const;

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('test', schema).subscribe(() => {

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
      const schema = { type: 'string' } as const;
      const dbVersion = 2;

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(dbName, storeName, dbVersion));

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('test', schema).subscribe(() => {

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

      const localStorageService = new SafeStorageMap(new LocalStorageDatabase(prefix));

      // tslint:disable-next-line: no-string-literal
      expect(localStorageService.fallbackBackingStore.prefix).toBe(prefix);

    });

  });

});
