import { mergeMap, tap, filter } from 'rxjs/operators';

import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { MemoryDatabase } from '../databases/memory-database';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_DB_VERSION } from '../tokens';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';
import { SafeStorageMap } from './safe-storage-map.service';
import { VALIDATION_ERROR } from './exceptions';
import { JSONSchema } from '../validation/json-schema';

function tests(description: string, localStorageServiceFactory: () => SafeStorageMap): void {

  interface Monster {
    name: string;
    address?: string;
  }

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

    describe(`get()`, () => {

      describe(`string`, () => {

        it('with value', (done) => {

          const value = 'blue';
          const schema = { type: 'string' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('empty', (done) => {

          const value = '';
          const schema = { type: 'string' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          // TODO: documentation, `as const` must not be used with explicit type
          // TODO: documentation needed, not working at all without `as const` AND without cast
          const value = 'hello';
          const schema = {
            type: 'string',
            const: 'hello',
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: 'hello' | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const without assertion', (done) => {

          const value = 'hello';
          const schema: JSONSchema = {
            type: 'string',
            const: 'hello',
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum', (done) => {

          const value = 'world';
          const schema = {
            type: 'string',
            enum: ['hello', 'world'],
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: 'hello' | 'world' | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum without assertion', (done) => {

          const value = 'world';
          const schema: JSONSchema = {
            type: 'string',
            enum: ['hello', 'world'],
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe(`number`, () => {

        it('with value', (done) => {

          const value = 1.5;
          const schema = { type: 'number' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('zero', (done) => {

          const value = 0;
          const schema = { type: 'number' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = 1.5;
          const schema = {
            type: 'number',
            const: 1.5,
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: 1.5 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const without assertion', (done) => {

          const value = 1.5;
          const schema: JSONSchema = {
            type: 'number',
            const: 1.5,
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum', (done) => {

          const value = 2.4;
          const schema = {
            type: 'number',
            enum: [1.5, 2.4],
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: 1.5 | 2.4 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum without assertion', (done) => {

          const value = 2.4;
          const schema: JSONSchema = {
            type: 'number',
            enum: [1.5, 2.4],
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe(`integer`, () => {

        it('with value', (done) => {

          const value = 1;
          const schema = { type: 'integer' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('zero', (done) => {

          const value = 0;
          const schema = { type: 'integer' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = 1;
          const schema = {
            type: 'integer',
            const: 1,
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: 1 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const without assertion', (done) => {

          const value = 1;
          const schema: JSONSchema = {
            type: 'integer',
            const: 1,
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum', (done) => {

          const value = 2;
          const schema = {
            type: 'integer',
            enum: [1, 2],
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: 1 | 2 | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('enum without assertion', (done) => {

          const value = 2;
          const schema: JSONSchema = {
            type: 'integer',
            enum: [1, 2],
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

      });

      describe(`boolean`, () => {

        it('true', (done) => {

          const value = true;
          const schema = { type: 'boolean' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('false', (done) => {

          const value = false;
          const schema = { type: 'boolean' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const', (done) => {

          const value = true;
          const schema = {
            type: 'boolean',
            const: true,
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: true | undefined) => {

            expect(result).toBe(value);

            done();

          });

        });

        it('const without assertion', (done) => {

          const value = true;
          const schema: JSONSchema = {
            type: 'boolean',
            const: true,
          };

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: boolean | undefined) => {

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

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: boolean[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('of arrays', (done) => {

          const value = [['hello', 'world'], ['my', 'name'], ['is', 'Elmo']];
          const schema = {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'string' },
            },
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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
          const schema = {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
              },
              required: ['name'],
            },
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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

          localStorageService.set(key, Array.from(value), schema).pipe(
            mergeMap(() => localStorageService.get(key, schema)),
          ).subscribe((result: string[] | undefined) => {

            expect(result).toEqual(array);

            done();

          });

        });

      });

      describe('tuple', () => {

        it('with 1 value', (done) => {

          // TODO: documente, type required
          const value: [Monster] = [{
            name: 'Elmo',
            address:  'Sesame street',
          }];
          const schema = {
            type: 'array',
            items: [{
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
              },
              required: ['name'],
            }],
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: [Monster] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('with 2 values', (done) => {

          const value: [string, Monster] = ['hello', {
            name: 'Elmo',
            address:  'Sesame street',
          }];
          const schema = {
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
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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
          const schema = {
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
          } as const;

          localStorageService.set(key, Array.from(value), schema).pipe(
            mergeMap(() => localStorageService.get(key, schema)),
          ).subscribe((result: [string, Monster][] | undefined) => {

            expect(result).toEqual(array);

            done();

          });

        });

        it('with 3 primitive values', (done) => {

          const value: [string, number, boolean] = ['hello', 2, true];
          const schema = {
            type: 'array',
            items: [
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' },
            ],
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: [string, number, boolean] | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('with 3 complex values', (done) => {

          const value: [string, number, Monster] = ['hello', 2, {
            name: 'Elmo',
            address:  'Sesame street',
          }];
          const schema = {
            type: 'array',
            items: [
              { type: 'string' },
              { type: 'number' },
              {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                },
                required: ['name'],
              }
            ],
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: unknown[] | undefined) => {

            expect(result).toEqual(value);

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
          const schema = {
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
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
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
          const schema = {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: User | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

        it('without const assertion', (done) => {

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

          // TODO: documentation, `as const` needed, and no type on value
          const value = {
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

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((result: Partial<User> | undefined) => {

            expect(result).toEqual(value);

            done();

          });

        });

      });

      describe('specials', () => {

        it('unexisting key', (done) => {

          const schema = { type: 'string' } as const;

          localStorageService.get(`unknown${Date.now()}`, schema).subscribe((data: string | undefined) => {

            expect(data).toBeUndefined();

            done();

          });

        });

        it('null', (done) => {

          const schema = { type: 'string' } as const;

          localStorageService.set(key, 'test', schema).pipe(
            mergeMap(() => localStorageService.set(key, null, schema)),
            mergeMap(() => localStorageService.get(key, schema)),
          ).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

            done();

          });

        });

        it('undefined', (done) => {

          const schema = { type: 'string' } as const;

          localStorageService.set(key, 'test', schema).pipe(
            mergeMap(() => localStorageService.set(key, undefined, schema)),
            mergeMap(() => localStorageService.get(key, schema)),
          ).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

            done();

          });

        });

        it('blob (will be pending in Safari private)', (done) => {

          const value = new Blob();
          const schema = { type: 'unknown' } as const;

          localStorageService.set(key, value, schema).pipe(
            mergeMap(() => localStorageService.get(key, schema))
          ).subscribe((localStorageService.backingEngine === 'localStorage') ? {
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

        it('unknown schema', (done) => {

          const schema = { type: 'unknown' } as const;

          // @ts-expect-error
          localStorageService.get(key, schema).subscribe((result: string | undefined) => {

            expect().nothing();

            done();

          });

        });

      });

    });

    describe(('set()'), () => {

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

    describe('deletion', () => {

      it('delete() with existing key', (done) => {

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'test', schema).pipe(
          mergeMap(() => localStorageService.delete(key)),
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('delete() with unexisting key', (done) => {

        localStorageService.delete(`unexisting${Date.now()}`).subscribe(() => {

            expect().nothing();

            done();

        });

      });

      it('clear()', (done) => {

        const schema = { type: 'string' } as const;

        localStorageService.set(key, 'test', schema).pipe(
          mergeMap(() => localStorageService.clear()),
          mergeMap(() => localStorageService.get(key, schema))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

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
        });

      });

      it('keys() when no items', (done) => {

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

    describe('watch()', () => {

      it('valid', (done) => {

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

    });

    describe('validation', () => {

      const schema = {
        type: 'object',
        properties: {
          expected: {
            type: 'string'
          }
        },
        required: ['expected']
      } as const;

      it('valid schema with options', (done) => {

        const value = 5;
        const schemaWithOptions = { type: 'number', maximum: 10 } as const;

        localStorageService.set(key, value, schemaWithOptions).pipe(
          mergeMap(() => localStorageService.get(key, schemaWithOptions)),
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('invalid schema with options', (done) => {

        const value = 15;
        const schemaWithOptions = { type: 'number', maximum: 10 } as const;

        localStorageService.set(key, value, { type: 'number' } as const).pipe(
          mergeMap(() => localStorageService.get(key, schemaWithOptions)),
        ).subscribe({
          error: (error) => {

            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });

      });

      it('invalid in get()', (done) => {

        localStorageService.set(key, 'test', { type: 'string' } as const).pipe(
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

      it('invalid in watch()', (done) => {

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

      it('null: no validation', (done) => {

        localStorageService.get(`noassociateddata${Date.now()}`, schema).subscribe(() => {

          expect().nothing();

          done();

        });

      });

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
     * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe('complete', () => {

      const schema = { type: 'string' } as const;

      it('get()', (done) => {

        localStorageService.get(key, schema).subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('set()', (done) => {

        localStorageService.set('index', 'value', schema).subscribe({
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

    describe('compatibility with Promise', () => {

      const schema = { type: 'string' } as const;

      it('Promise', (done) => {

        const value = 'test';

        localStorageService.set(key, value, schema).toPromise()
          .then(() => localStorageService.get(key, schema).toPromise())
          .then((result: string | undefined) => {
            expect(result).toBe(value);
            done();
          });

      });

      it('async / await', async () => {

        const value = 'test';

        await localStorageService.set(key, value, schema).toPromise();

        const result: string | undefined = await localStorageService.get(key, schema).toPromise();

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

  tests('indexedDB with custom options', () => new SafeStorageMap(new IndexedDBDatabase('customDbTest', 'storeTest', 2, false)));

  describe('browser APIs', () => {

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('IndexedDb is used (will be pending in Firefox/IE private mode)', (done) => {

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

    it('indexedDb with default options (will be pending in Firefox private mode)', (done) => {

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

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('indexedDb with noWrap to false (will be pending in Firefox/IE private mode)', (done) => {

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

    it('indexedDb with custom options (will be pending in Firefox private mode)', (done) => {

      /* Unique names to be sure `indexedDB` `upgradeneeded` event is triggered */
      const dbName = `dbCustom${Date.now()}`;
      const storeName = `storeCustom${Date.now()}`;
      const schema = { type: 'string' } as const;
      const dbVersion = 2;
      const noWrap = false;

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(dbName, storeName, dbVersion, noWrap));

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

    it('localStorage with prefix', () => {

      const prefix = `ls_`;

      const localStorageService = new SafeStorageMap(new LocalStorageDatabase(prefix));

      expect(localStorageService.fallbackBackingStore.prefix).toBe(prefix);

    });

  });

});
