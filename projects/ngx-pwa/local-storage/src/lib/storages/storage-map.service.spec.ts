import { mergeMap } from 'rxjs/operators';

import { MemoryDatabase } from '../databases/memory-database';
import { JSONSchema, JSONSchemaNumber } from '../validation/json-schema';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';
import { StorageMap } from './storage-map.service';
import { VALIDATION_ERROR } from './exceptions';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { IndexedDBDatabase } from '../databases/indexeddb-database';

function tests(description: string, localStorageServiceFactory: () => StorageMap): void {

  const key = 'test';
  let storage: StorageMap;

  describe(description, () => {

    beforeAll(() => {
      /* Via a factory as the class should be instancied only now, not before, otherwise tests could overlap */
      storage = localStorageServiceFactory();
    });

    beforeEach((done) => {
      /* Clear data to avoid tests overlap */
      clearStorage(done, storage);
    });

    afterAll((done) => {
      /* Now that `indexedDB` store name can be customized, it's important:
        * - to delete the database after each tests group,
        * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
        * as it's where the store is created
        * - to be able to delete the database, all connections to it must be closed */
      closeAndDeleteDatabase(done, storage);
    });

    describe('overloads', () => {

      it('no schema / no cast', (done) => {

        // @ts-expect-error
        storage.get('test').subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('no schema / cast', (done) => {

        // @ts-expect-error
        // tslint:disable-next-line: deprecation
        storage.get<number>('test').subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('schema / cast', (done) => {

        storage.get<string>('test', { type: 'string' }).subscribe((_: string | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('schema / wrong cast', (done) => {

        // tslint:disable-next-line: deprecation
        storage.get<number>('test', { type: 'string' }).subscribe((_: string | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('schema with options', (done) => {

        storage.get('test', { type: 'number', maximum: 10 }).subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('prepared schema with generic interface', (done) => {

        const schema: JSONSchema = { type: 'number' };

        storage.get('test', schema).subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('prepared schema with specific interface', (done) => {

        const schema: JSONSchemaNumber = { type: 'number' };

        storage.get('test', schema).subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('string', (done) => {

        storage.get('test', { type: 'string' }).subscribe((_: string | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special string', (done) => {

        type Theme = 'dark' | 'light';

        storage.get<Theme>('test', { type: 'string', enum: ['dark', 'light'] }).subscribe((_: Theme | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('number', (done) => {

        storage.get('test', { type: 'number' }).subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special number', (done) => {

        type SomeNumbers = 1.5 | 2.5;

        storage.get<SomeNumbers>('test', { type: 'number', enum: [1.5, 2.5] }).subscribe((_: SomeNumbers | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('integer', (done) => {

        storage.get('test', { type: 'integer' }).subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special integer', (done) => {

        type SpecialIntegers = 1 | 2;

        storage.get<SpecialIntegers>('test', { type: 'integer', enum: [1, 2] }).subscribe((_: SpecialIntegers | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('boolean', (done) => {

        storage.get('test', { type: 'boolean' }).subscribe((_: boolean | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('array of strings', (done) => {

        storage.get('test', {
          type: 'array',
          items: { type: 'string' },
        }).subscribe((_: string[] | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special array of strings', (done) => {

        type Themes = ('dark' | 'light')[];

        storage.get<Themes>('test', {
          type: 'array',
          items: {
            type: 'string',
            enum: ['dark', 'light'],
          },
        }).subscribe((_: Themes | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special readonly array of strings', (done) => {

        type Themes = readonly ('dark' | 'light')[];

        storage.get<Themes>('test', {
          type: 'array',
          items: {
            type: 'string',
            enum: ['dark', 'light'],
          },
        }).subscribe((_: Themes | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('array of numbers', (done) => {

        storage.get('test', {
          type: 'array',
          items: { type: 'number' },
        }).subscribe((_: number[] | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special array of numbers', (done) => {

        type NumbersArray = (1 | 2)[];

        storage.get<NumbersArray>('test', {
          type: 'array',
          items: {
            type: 'number',
            enum: [1, 2],
          },
        }).subscribe((_: NumbersArray | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('special readonly array of numbers', (done) => {

        type NumbersArray = readonly (1 | 2)[];

        storage.get<NumbersArray>('test', {
          type: 'array',
          items: {
            type: 'number',
            enum: [1, 2],
          },
        }).subscribe((_: NumbersArray | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('array of integers', (done) => {

        storage.get('test', {
          type: 'array',
          items: { type: 'integer' },
        }).subscribe((_: number[] | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('array of booleans', (done) => {

        storage.get('test', {
          type: 'array',
          items: { type: 'boolean' },
        }).subscribe((_: boolean[] | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('tuple', (done) => {

        storage.get<[string, number][]>('test', {
          type: 'array',
          items: {
            type: 'array',
            items: [
              { type: 'string' },
              { type: 'number' },
            ],
          },
        }).subscribe((_: [string, number][] | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('array of objects', (done) => {

        interface Test {
          test: string;
        }

        storage.get<Test[]>('test', {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              test: { type: 'string' },
            },
            required: ['test'],
          }
        }).subscribe((_: Test[] | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('objects / cast / no schema', (done) => {

        interface Test {
          test: string;
        }

        // @ts-expect-error
        // tslint:disable-next-line: deprecation
        storage.get<Test>('test').subscribe((_: Test | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('objects / no cast / schema', (done) => {

        storage.get('test', {
          type: 'object',
          properties: {
            test: { type: 'string' }
          }
        // @ts-expect-error
        }).subscribe((_: Test | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('objects / cast / schema', (done) => {

        interface Test {
          test: string;
        }

        storage.get<Test>('test', {
          type: 'object',
          properties: {
            test: { type: 'string' }
          }
        }).subscribe((_: Test | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('with const assertion', (done) => {

        interface Test {
          test: string;
        }

        storage.get<Test>('test', {
          type: 'object',
          properties: {
            test: {
              type: 'string',
              enum: ['hello', 'world'],
            },
            list: {
              type: 'array',
              items: [{ type: 'string' }, { type: 'number' }],
            },
          },
          required: ['test'],
        } as const).subscribe((_: Test | undefined) => {

          expect().nothing();
          done();

        });

      });

    });

    describe('validation', () => {

      const schema: JSONSchema = {
        type: 'object',
        properties: {
          expected: { type: 'string' },
        },
        required: ['expected'],
      };

      it('valid', (done) => {

        const value = { expected: 'value' };

        storage.set(key, value, schema).pipe(
          mergeMap(() => storage.get(key, schema)),
        ).subscribe((data) => {

          expect(data).toEqual(value);

          done();

        });

      });

      it('invalid in get()', (done) => {

        storage.set(key, 'test').pipe(
          mergeMap(() => storage.get(key, schema))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('invalid in set()', (done) => {

        storage.set(key, 'test', schema).pipe(
          mergeMap(() => storage.get(key, { type: 'string' }))
        ).subscribe({ error: (error) => {

          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('invalid in watch()', (done) => {

        const watchedKey = 'watched2';

        storage.set(watchedKey, 'test').subscribe(() => {

          storage.watch(watchedKey, schema).subscribe({
            error: () => {
              expect().nothing();
              done();
            }
          });

        });

      });

      it('null: no validation', (done) => {

        storage.get<{ expected: string }>(`noassociateddata${Date.now()}`, schema).subscribe(() => {

          expect().nothing();
          done();

        });

      });

    });

  });

}

describe('StorageMap', () => {

  tests('memory', () => new StorageMap(new MemoryDatabase()));

  tests('localStorage', () => new StorageMap(new LocalStorageDatabase()));

  tests('indexedDB', () => new StorageMap(new IndexedDBDatabase()));

});
