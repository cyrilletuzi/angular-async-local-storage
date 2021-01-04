import { mergeMap } from 'rxjs/operators';

import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { MemoryDatabase } from '../databases/memory-database';
import { JSONSchema } from '../validation/json-schema';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning.spec';
import { LocalStorage } from './local-storage.service';
import { StorageMap } from './storage-map.service';
import { VALIDATION_ERROR } from './exceptions';

function tests(description: string, localStorageServiceFactory: () => LocalStorage): void {

  const key = 'test';
  let storage: LocalStorage;

  describe(description, () => {

    beforeAll(() => {
      /* Via a factory as the class should be instancied only now, not before, otherwise tests could overlap */
      storage = localStorageServiceFactory();
    });

    beforeEach((done) => {
      /* Clear data to avoid tests overlap */
      // eslint-disable-next-line @typescript-eslint/dot-notation
      clearStorage(done, storage['storageMap']);
    });

    afterAll((done) => {
      /* Now that `indexedDB` store name can be customized, it's important:
       * - to delete the database after each tests group,
       * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
       * as it's where the store is created
       * - to be able to delete the database, all connections to it must be closed */
      // eslint-disable-next-line @typescript-eslint/dot-notation
      closeAndDeleteDatabase(done, storage['storageMap']);
    });

    describe('validation', () => {

      interface Test {
        expected: string;
      }

      const schema: JSONSchema = {
        type: 'object',
        properties: {
          expected: { type: 'string' }
        },
        required: ['expected'],
      };

      it('valid', (done) => {

        const value = { expected: 'test' };

        storage.setItem(key, value).pipe(
          mergeMap(() => storage.getItem<Test>(key, schema))
        ).subscribe((result: Test | null) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('no schema', (done) => {

        const value = { expected: 'test' };

        storage.setItem(key, value).pipe(
          mergeMap(() => storage.getItem(key))
        ).subscribe((result: unknown | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('cast no schema', (done) => {

        const value = { expected: 'test' };

        storage.setItem(key, value).pipe(
          mergeMap(() => storage.getItem<Test>(key))
        // @ts-expect-error Failture test
        ).subscribe((_: Test | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('invalid with direct schema', (done) => {

        storage.setItem(key, 'test').pipe(
          mergeMap(() => storage.getItem(key, schema))
        ).subscribe({ error: (error) => {

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('invalid with nested schema', (done) => {

        storage.setItem(key, 'test').pipe(
          mergeMap(() => storage.getItem(key, { schema }))
        ).subscribe({ error: (error) => {

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

    });

    describe('special mappings', () => {

      it('undefined converted to null in getItem()', (done) => {

        storage.setItem(key, undefined).pipe(
          mergeMap(() => storage.getItem(key)),
        ).subscribe((result) => {

          expect(result).toBeNull();
          done();

        });

      });

      it('result to true in setItem()', (done) => {

        storage.setItem(key, 'test').subscribe((result: boolean) => {

          expect(result).toBeTrue();
          done();

        });

      });

      it('result to true in removeItem()', (done) => {

        storage.removeItem(key).subscribe((result: boolean) => {

          expect(result).toBeTrue();
          done();

        });

      });

      it('result to true in clear()', (done) => {

        storage.clear().subscribe((result: boolean) => {

          expect(result).toBeTrue();
          done();

        });

      });

    });

  });

}

describe('LocalStorage', () => {

  tests('memory', () => new LocalStorage(new StorageMap(new MemoryDatabase())));

  tests('localStorage', () => new LocalStorage(new StorageMap(new LocalStorageDatabase())));

  tests('indexedDB', () => new LocalStorage(new StorageMap(new IndexedDBDatabase())));

});
