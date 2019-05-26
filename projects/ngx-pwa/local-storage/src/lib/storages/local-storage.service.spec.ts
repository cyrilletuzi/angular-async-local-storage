import { from } from 'rxjs';
import { mergeMap, filter, tap } from 'rxjs/operators';

import { LocalStorage } from './local-storage.service';
import { StorageMap } from './storage-map.service';
import { VALIDATION_ERROR } from './exceptions';
import { IndexedDBDatabase, LocalStorageDatabase, MemoryDatabase } from '../databases';
import { JSONSchema } from '../validation';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';

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
      // tslint:disable-next-line: no-string-literal
      clearStorage(done, localStorageService['storageMap']);
    });

    afterAll((done) => {
      /* Now that `indexedDB` store name can be customized, it's important:
       * - to delete the database after each tests group,
       * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
       * as it's where the store is created
       * - to be able to delete the database, all connections to it must be closed */
      // tslint:disable-next-line: no-string-literal
      closeAndDeleteDatabase(done, localStorageService['storageMap']);
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
          // tslint:disable-next-line: deprecation
          mergeMap(() => localStorageService.keys()),
        ).subscribe((keys) => {

          /* Sorting because keys order is not standard in `localStorage` (in Firefox especially) */
          expect([key1, key2].sort()).toEqual(keys.sort());

          done();

        });

      });

      it('getKey() when no items', (done) => {

        // tslint:disable-next-line: deprecation
        localStorageService.keys().subscribe((keys) => {

          expect(keys.length).toBe(0);

          done();

        });

      });

      it('key() on existing', (done) => {

        localStorageService.setItem(key, 'test').pipe(
          // tslint:disable-next-line: deprecation
          mergeMap(() => localStorageService.has(key))
        ).subscribe((result) => {

          expect(result).toBe(true);

          done();

        });

      });

      it('key() on unexisting', (done) => {

        // tslint:disable-next-line: deprecation
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
          // tslint:disable-next-line: deprecation
          mergeMap(() => localStorageService.keys()),
          /* Now we will have an `Observable` emiting multiple values */
          mergeMap((keys) => from(keys)),
          filter((currentKey) => currentKey.startsWith('app_')),
          mergeMap((currentKey) => localStorageService.removeItem(currentKey)),
        ).subscribe({
          /* So we need to wait for completion of all actions to check */
          complete: () => {


          localStorageService.length.subscribe((size) => {

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

      it('length', (done) => {

        localStorageService.length.subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('keys()', (done) => {

        // tslint:disable-next-line: deprecation
        localStorageService.keys().subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

      it('has()', (done) => {

        // tslint:disable-next-line: deprecation
        localStorageService.has(key).subscribe({
          complete: () => {

            expect().nothing();

            done();

          }
        });

      });

    });

  });

}

describe('LocalStoage', () => {

  tests('memory', () => new LocalStorage(new StorageMap(new MemoryDatabase())));

  tests('localStorage', () => new LocalStorage(new StorageMap(new LocalStorageDatabase())));

  tests('indexedDB', () => new LocalStorage(new StorageMap(new IndexedDBDatabase())));

});
