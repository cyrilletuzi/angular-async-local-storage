import { mergeMap, tap, filter } from 'rxjs/operators';

import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { MemoryDatabase } from '../databases/memory-database';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_DB_VERSION } from '../tokens';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';
import { StorageMap } from './storage-map.service';
import { VALIDATION_ERROR } from './exceptions';
import { JSONSchema, JSONSchemaNumber } from '../validation/json-schema';

function tests(description: string, localStorageServiceFactory: () => StorageMap): void {

  interface Monster {
    name: string;
    address?: string;
  }

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

        // @ts-expect-error Failure test
        storage.get('test').subscribe((_: number | undefined) => {

          expect().nothing();
          done();

        });

      });

      it('no schema / cast', (done) => {

        // @ts-expect-error Failure test
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

    });

    describe(`get()`, () => {

      describe(`string`, () => {

        it('with value', (done) => {

          const value = 'blue';
          const schema: JSONSchema = { type: 'string' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('empty', (done) => {

          const value = '';
          const schema: JSONSchema = { type: 'string' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = 'hello';
          const schema: JSONSchema = {
            type: 'string',
            const: 'hello',
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<'hello'>(key, schema))
          ).subscribe((result: 'hello' | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum', (done) => {

          const value = 'world';
          const schema: JSONSchema = {
            type: 'string',
            enum: ['hello', 'world'],
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<'hello' | 'world'>(key, schema))
          ).subscribe((result: 'hello' | 'world' | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe(`number`, () => {

        it('with value', (done) => {

          const value = 1.5;
          const schema: JSONSchema = { type: 'number' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('zero', (done) => {

          const value = 0;
          const schema: JSONSchema = { type: 'number' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = 1.5;
          const schema: JSONSchema = {
            type: 'number',
            const: 1.5,
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<1.5>(key, schema))
          ).subscribe((result: 1.5 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum', (done) => {

          const value = 2.4;
          const schema: JSONSchema = {
            type: 'number',
            enum: [1.5, 2.4],
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<1.5 | 2.4>(key, schema))
          ).subscribe((result: 1.5 | 2.4 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe(`integer`, () => {

        it('with value', (done) => {

          const value = 1;
          const schema: JSONSchema = { type: 'integer' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('zero', (done) => {

          const value = 0;
          const schema: JSONSchema = { type: 'integer' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = 1;
          const schema: JSONSchema = {
            type: 'integer',
            const: 1,
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<1>(key, schema))
          ).subscribe((result: 1 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum', (done) => {

          const value = 2;
          const schema: JSONSchema = {
            type: 'integer',
            enum: [1, 2],
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<1 | 2>(key, schema))
          ).subscribe((result: 1 | 2 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe(`boolean`, () => {

        it('true', (done) => {

          const value = true;
          const schema: JSONSchema = { type: 'boolean' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('false', (done) => {

          const value = false;
          const schema: JSONSchema = { type: 'boolean' };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = true;
          const schema: JSONSchema = {
            type: 'boolean',
            const: true,
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<true>(key, schema))
          ).subscribe((result: true | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe('array', () => {

        it('of strings', (done) => {

          const value = ['hello', 'world', '!'];
          const schema = {
            type: 'array',
            items: { type: 'string' },
          } as const;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: string[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('of integers', (done) => {

          const value = [1, 2, 3];
          const schema = {
            type: 'array',
            items: { type: 'integer' },
          } as const;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: number[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('of numbers', (done) => {

          const value = [1.5, 2.4, 3.67];
          const schema = {
            type: 'array',
            items: { type: 'number' },
          } as const;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: number[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('of booleans', (done) => {

          const value = [true, false, true];
          const schema = {
            type: 'array',
            items: { type: 'boolean' },
          } as const;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: boolean[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('of arrays', (done) => {

          const value = [['hello', 'world'], ['my', 'name'], ['is', 'Elmo']];
          const schema: JSONSchema = {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'string' },
            },
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<string[][]>(key, schema))
          ).subscribe((result: string[][] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('of objects', (done) => {

          const value = [{
            name: 'Elmo',
            address:  'Sesame street',
          }, {
            name: 'Cookie',
          }, {
            name: 'Chester',
          }];
          const schema: JSONSchema = {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
              },
              required: ['name'],
            },
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<Monster[]>(key, schema))
          ).subscribe((result: Monster[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('Set', (done) => {

          const array = ['hello', 'world'];
          const value = new Set<string>(['hello', 'world']);
          const schema = {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          } as const;

          storage.set(key, Array.from(value), schema).pipe(
            mergeMap(() => storage.get(key, schema)),
          ).subscribe((result: string[] | undefined) => {

            expect(result).toEqual(array);

            done();

          });

        });

        it('tuple', (done) => {

          const value: [string, Monster] = ['hello', {
            name: 'Elmo',
            address:  'Sesame street',
          }];
          const schema: JSONSchema = {
            type: 'array',
            items: [{
              type: 'string'
            }, {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
              },
              required: ['name'],
            }],
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<[string, Monster]>(key, schema))
          ).subscribe((result: [string, Monster] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('Map', (done) => {

          const array: [string, Monster][] = [
            ['Elmo', {
              name: 'Elmo',
              address:  'Sesame street',
            }],
            ['Cookie', {
              name: 'Cookie',
            }],
          ];
          const value = new Map<string, Monster>(array);
          const schema: JSONSchema = {
            type: 'array',
            items: {
              type: 'array',
              items: [{
                type: 'string'
              }, {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                },
                required: ['name'],
              }],
            },
          };

          storage.set(key, Array.from(value), schema).pipe(
            mergeMap(() => storage.get<[string, Monster][]>(key, schema)),
          ).subscribe((result: [string, Monster][] | undefined) => {

            expect(result).toEqual(array);

            done();

          });

        });

      });

      describe('object', () => {

        it('with all subtypes', (done) => {

          interface User {
            name: string;
            age: number;
            philosopher: boolean;
            books: string[];
            family: {
              brothers: number;
              sisters: number;
            };
            creditCard?: number;
          }

          const value: User = {
            name: 'Henri Bergson',
            age: 81,
            philosopher: true,
            books: [`Essai sur les données immédiates de la conscience`, `Matière et mémoire`],
            family: {
              brothers: 5,
              sisters: 3,
            },
          };
          const schema: JSONSchema = {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              philosopher: { type: 'boolean' },
              books: {
                type: 'array',
                items: { type: 'string' },
              },
              family: {
                type: 'object',
                properties: {
                  brothers: { type: 'integer' },
                  sisters: { type: 'integer' },
                },
                required: ['brothers', 'sisters']
              },
              creditCard: { type: 'number' },
            },
            required: ['name', 'age', 'philosopher', 'books', 'family'],
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<User>(key, schema))
          ).subscribe((result: User | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('without required properties', (done) => {

          interface User {
            name?: string;
            age?: number;
          }

          const value: User = {
            name: 'Henri Bergson',
          };
          const schema: JSONSchema = {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          };

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<User>(key, schema))
          ).subscribe((result: User | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('objects / cast / no schema', (done) => {

          interface Test {
            test: string;
          }

          // @ts-expect-error Failure test
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
          // @ts-expect-error Failure test
          }).subscribe((_: Test | undefined) => {

            expect().nothing();
            done();

          });

        });

      });

      describe('specials', () => {

        it('unexisting key', (done) => {

          const schema: JSONSchema = { type: 'string' };

          storage.get(`unknown${Date.now()}`, schema).subscribe((data: string | undefined) => {

            expect(data).toBeUndefined();

            done();

          });

        });

        it('null', (done) => {

          const schema: JSONSchema = { type: 'string' };

          storage.set(key, 'test', schema).pipe(
            mergeMap(() => storage.set(key, null, schema)),
            mergeMap(() => storage.get(key, schema)),
          ).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

            done();

          });

        });

        it('undefined', (done) => {

          const schema: JSONSchema = { type: 'string' };

          storage.set(key, 'test', schema).pipe(
            mergeMap(() => storage.set(key, undefined, schema)),
            mergeMap(() => storage.get(key, schema)),
          ).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

            done();

          });

        });

        it('blob (will be pending in Safari private)', (done) => {

          const value = new Blob();

          storage.set(key, value).pipe(
            mergeMap(() => storage.get(key))
          ).subscribe((storage.backingEngine === 'localStorage') ? {
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
          });

        });

        it('heavy schema', (done) => {

          interface City {
            country: string;
            population: number;
            coordinates: [number, number];
            monuments?: {
              name: string;
              constructionYear?: number;
            }[];
          }

          const value: [string, City][] = [
            ['Paris', {
              country: 'France',
              population: 2187526,
              coordinates: [48.866667, 2.333333],
              monuments: [{
                name: `Tour Eiffel`,
                constructionYear: 1889,
              }, {
                name: `Notre-Dame de Paris`,
                constructionYear: 1345,
              }],
            }],
            ['Kyōto', {
              country: 'Japan',
              population: 1467702,
              coordinates: [35.011665, 135.768326],
              monuments: [{
                name: `Sanjūsangen-dō`,
                constructionYear: 1164,
              }],
            }],
          ];

          const schema: JSONSchema = {
            type: 'array',
            items: {
              type: 'array',
              items: [{
                type: 'string'
              }, {
                type: 'object',
                properties: {
                  country: { type: 'string' },
                  population: { type: 'integer' },
                  coordinates: {
                    type: 'array',
                    items: [
                      { type: 'number'},
                      { type: 'number'},
                    ],
                  },
                  monuments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        constructionYear: { type: 'integer' },
                      },
                      required: ['name'],
                    },
                  },
                },
                required: ['country', 'population', 'coordinates'],
              }]
            },
          };


          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<[string, City][]>(key, schema)),
          ).subscribe((result: [string, City][] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

      });

    });

    describe('set()', () => {

      it('update', (done) => {

        const schema: JSONSchema = { type: 'string' };

        storage.set(key, 'value', schema).pipe(
          mergeMap(() => storage.set(key, 'updated', schema))
        ).subscribe(() => {

            expect().nothing();

            done();

          });

      });

      it('concurrency', (done) => {

        const value1 = 'test1';
        const value2 = 'test2';
        const schema: JSONSchema = { type: 'string' };

        expect(() => {

          storage.set(key, value1, schema).subscribe();

          storage.set(key, value2, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result) => {

            expect(result).toBe(value2);

            done();

          });

        }).not.toThrow();

      });

    });

    describe('deletion', () => {

      it('delete() with existing key', (done) => {

        storage.set(key, 'test').pipe(
          mergeMap(() => storage.delete(key)),
          mergeMap(() => storage.get(key))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('delete() with unexisting key', (done) => {

        storage.delete(`unexisting${Date.now()}`).subscribe(() => {

            expect().nothing();

            done();

        });

      });

      it('clear()', (done) => {

        storage.set(key, 'test').pipe(
          mergeMap(() => storage.clear()),
          mergeMap(() => storage.get(key))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

    });

    describe('Map-like API', () => {

      it('size', (done) => {

        storage.size.pipe(
          tap((length) => { expect(length).toBe(0); }),
          mergeMap(() => storage.set(key, 'test')),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => storage.set('', 'test')),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(2); }),
          mergeMap(() => storage.delete(key)),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => storage.clear()),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(0); }),
        ).subscribe(() => {
          done();
        });

      });

      it('keys()', (done) => {

        const key1 = 'index1';
        const key2 = 'index2';
        const keys = [key1, key2];

        storage.set(key1, 'test').pipe(
          mergeMap(() => storage.set(key2, 'test')),
          mergeMap(() => storage.keys()),
        ).subscribe({
          next: (value) => {
            expect(keys).toContain(value);
            keys.splice(keys.indexOf(value), 1);
          },
          complete: () => {
            done();
          },
        });

      });

      it('keys() when no items', (done) => {

        storage.keys().subscribe({
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

        storage.set(key, 'test').pipe(
          mergeMap(() => storage.has(key))
        ).subscribe((result) => {

          expect(result).toBe(true);

          done();

        });

      });

      it('has() on unexisting', (done) => {

        storage.has(`nokey${Date.now()}`).subscribe((result) => {

          expect(result).toBe(false);

          done();

        });

      });

      it('advanced case: remove only some items', (done) => {

        storage.set('user_firstname', 'test').pipe(
          mergeMap(() => storage.set('user_lastname', 'test')),
          mergeMap(() => storage.set('app_data1', 'test')),
          mergeMap(() => storage.set('app_data2', 'test')),
          mergeMap(() => storage.keys()),
          filter((currentKey) => currentKey.startsWith('app_')),
          mergeMap((currentKey) => storage.delete(currentKey)),
        ).subscribe({
          /* So we need to wait for completion of all actions to check */
          complete: () => {

            storage.size.subscribe((size) => {

              expect(size).toBe(2);

              done();

            });

          }
        });

      });

    });

    describe('watch()', () => {

      it('valid', (done) => {

        const watchedKey = 'watched1';
        const values = [undefined, 'test1', undefined, 'test2', undefined];
        const schema: JSONSchema = { type: 'string' };
        let i = 0;

        storage.watch(watchedKey, schema).subscribe((result: string | undefined) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === 1) {

            storage.set(watchedKey, values[1], schema).pipe(
              mergeMap(() => storage.delete(watchedKey)),
              mergeMap(() => storage.set(watchedKey, values[3], schema)),
              mergeMap(() => storage.clear()),
            ).subscribe();

          }

          if (i === values.length) {
            done();
          }

        });

      });

    });

    describe('validation', () => {

      interface Test {
        expected: string;
      }

      const schema: JSONSchema = {
        type: 'object',
        properties: {
          expected: {
            type: 'string'
          }
        },
        required: ['expected']
      };

      it('valid schema with options', (done) => {

        const value = 5;
        const schemaWithOptions: JSONSchema = { type: 'number', maximum: 10 };

        storage.set(key, value, schemaWithOptions).pipe(
          mergeMap(() => storage.get(key, schemaWithOptions)),
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('invalid schema with options', (done) => {

        const value = 15;
        const schemaWithOptions: JSONSchema = { type: 'number', maximum: 10 };

        storage.set(key, value, { type: 'number' }).pipe(
          mergeMap(() => storage.get(key, schemaWithOptions)),
        ).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });

      });

      it('invalid in get()', (done) => {

        storage.set(key, 'test', { type: 'string' }).pipe(
          mergeMap(() => storage.get<Test>(key, schema))
        ).subscribe({ error: (error) => {

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(error.message).toBe(VALIDATION_ERROR);

          done();

        } });

      });

      it('invalid in set()', (done) => {

        storage.set(key, 'test', schema).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);
            done();

          },
        });

      });

      it('invalid in watch()', (done) => {

        const watchedKey = 'watched2';

        storage.set(watchedKey, 'test', { type: 'string' }).subscribe(() => {

          storage.watch(watchedKey, { type: 'number' }).subscribe({
            error: () => {
              expect().nothing();
              done();
            }
          });

        });

      });

      it('null: no validation', (done) => {

        storage.get<string>(`noassociateddata${Date.now()}`, schema).subscribe(() => {

          expect().nothing();

          done();

        });

      });

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
     * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe('complete', () => {

      const schema: JSONSchema = { type: 'string' };

      it('get()', (done) => {

        storage.get(key, schema).subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('set()', (done) => {

        storage.set('index', 'value', schema).subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('delete()', (done) => {

        storage.delete(key).subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('clear()', (done) => {

        storage.clear().subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('size', (done) => {

        storage.size.subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('keys()', (done) => {

        storage.keys().subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('has()', (done) => {

        storage.has(key).subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

    });

    describe('compatibility with Promise', () => {

      const schema: JSONSchema = { type: 'string' };

      it('Promise', (done) => {

        const value = 'test';

        storage.set(key, value, schema).toPromise()
          .then(() => storage.get(key, schema).toPromise())
          .then((result: string | undefined) => {
            expect(result).toBe(value);
            done();
          })
          .catch(() => {
            fail();
          });

      });

      it('async / await', async () => {

        const value = 'test';

        await storage.set(key, value, schema).toPromise();

        const result: string | undefined = await storage.get(key, schema).toPromise();

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

  tests('indexedDB with custom options', () => new StorageMap(new IndexedDBDatabase('customDbTest', 'storeTest', 2, false)));

  describe('browser APIs', () => {

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('IndexedDb is used (will be pending in Firefox/IE private mode)', (done) => {

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

    it('indexedDb with default options (will be pending in Firefox private mode)', (done) => {

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

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('indexedDb with noWrap to false (will be pending in Firefox/IE private mode)', (done) => {

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

    it('indexedDb with custom options (will be pending in Firefox private mode)', (done) => {

      /* Unique names to be sure `indexedDB` `upgradeneeded` event is triggered */
      const dbName = `dbCustom${Date.now()}`;
      const storeName = `storeCustom${Date.now()}`;
      const dbVersion = 2;
      const noWrap = false;

      const localStorageService = new StorageMap(new IndexedDBDatabase(dbName, storeName, dbVersion, noWrap));

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

    it('localStorage with prefix', () => {

      const prefix = `ls_`;

      const localStorageService = new StorageMap(new LocalStorageDatabase(prefix));

      expect(localStorageService.fallbackBackingStore.prefix).toBe(prefix);

    });

  });

});
