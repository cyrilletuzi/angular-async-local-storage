import { Subscription } from 'rxjs';
import { mergeMap, tap, filter } from 'rxjs/operators';

import { IndexedDBDatabase } from '../databases/indexeddb-database';
import { LocalStorageDatabase } from '../databases/localstorage-database';
import { MemoryDatabase } from '../databases/memory-database';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME, DEFAULT_IDB_DB_VERSION } from '../tokens';
import { clearStorage, closeAndDeleteDatabase } from '../testing/cleaning';
import { SafeStorageMap } from './safe-storage-map.service';
import { VALIDATION_ERROR, DatabaseEntriesKeyError } from './exceptions';

const dbSchema = {
  testString: {
    schema: { type: 'string' },
  },
  testStringConst: {
    schema: {
      type: 'string',
      const: 'hello',
    },
  },
  testStringEnum: {
    schema: {
      type: 'string',
      enum: ['hello', 'world'],
    },
  },
  testDate: {
    schema: {
      type: 'date',
    },
  },
  testNumber: {
    schema: { type: 'number' },
  },
  testNumberConst: {
    schema: {
      type: 'number',
      const: 1.5,
    },
  },
  testNumberEnum: {
    schema: {
      type: 'number',
      enum: [1.5, 2.4],
    },
  },
  testInteger: {
    schema: { type: 'integer' },
  },
  testIntegerConst: {
    schema: {
      type: 'integer',
      const: 1,
    },
  },
  testIntegerEnum: {
    schema: {
      type: 'integer',
      enum: [1, 2],
    },
  },
  testBoolean: {
    schema: { type: 'boolean' },
  },
  testBooleanConst: {
    schema: {
      type: 'boolean',
      const: true,
    },
  },
  testArrayOfStrings: {
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  testArrayOfNumbers: {
    schema: {
      type: 'array',
      items: { type: 'number' },
    },
  },
  testArrayOfIntegers: {
    schema: {
      type: 'array',
      items: { type: 'integer' },
    },
  },
  testArrayOfBooleans: {
    schema: {
      type: 'array',
      items: { type: 'boolean' },
    },
  },
  testArrayOfArrays: {
    schema: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
  testArrayOfObjects: {
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  testSet: {
    schema: {
      type: 'set',
      items: { type: 'string' },
    },
  },
  testTuple: {
    schema: {
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
  },
  testMap: {
    schema: {
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
    },
  },
  testObject: {
    schema: {
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
    },
  },
  testObjectWithoutRequired: {
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  testBlob: {
    schema: { type: 'unknown' },
  },
  testHeavy: {
    schema: {
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
                { type: 'number' },
                { type: 'number' },
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
    },
  },
  prefix1_data1: {
    schema: { type: 'string' },
  },
  prefix1_data2: {
    schema: { type: 'string' },
  },
  prefix2_data1: {
    schema: { type: 'string' },
  },
  prefix2_data2: {
    schema: { type: 'string' },
  },
  testSchema: {
    schema: { type: 'number', maximum: 10 },
  },
  testWatch: {
    schema: { type: 'string' },
  },
} as const;

function tests(description: string, localStorageServiceFactory: () => SafeStorageMap<typeof dbSchema>): void {

  interface Monster {
    name: string;
    address?: string;
  }

  let storage: SafeStorageMap<typeof dbSchema>;

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

    describe(`get()`, () => {

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('string', (done) => {

        const value = `${Date.now()}`;

        storage.set('testString', value).pipe(
          mergeMap(() => storage.get('testString'))
        ).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('string empty', (done) => {

        const value = '';

        storage.set('testString', value).pipe(
          mergeMap(() => storage.get('testString'))
        ).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('string const', (done) => {

        // TODO: documentation, `as const` must not be used with explicit type
        // TODO: documentation needed, not working at all without `as const` AND without cast
        const value = 'hello';

        storage.set('testStringConst', value).pipe(
          mergeMap(() => storage.get('testStringConst'))
        ).subscribe((result: 'hello' | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('string const without assertion', (done) => {

        const value = 'hello';

        storage.set('testStringConst', value).pipe(
          mergeMap(() => storage.get('testStringConst'))
        ).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('string enum', (done) => {

        const value = 'world';

        storage.set('testStringEnum', value).pipe(
          mergeMap(() => storage.get('testStringEnum'))
        ).subscribe((result: 'hello' | 'world' | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('string enum without assertion', (done) => {

        // TODO: check
        const value = 'world';

        storage.set('testStringEnum', value).pipe(
          mergeMap(() => storage.get('testStringEnum'))
        ).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('Date', (done) => {

        const value = new Date(Date.now());

        storage.set('testDate', value).pipe(
          mergeMap(() => storage.get('testDate'))
        ).subscribe((result: Date | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('number', (done) => {

        const value = Math.random();

        storage.set('testNumber', value).pipe(
          mergeMap(() => storage.get('testNumber'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number zero', (done) => {

        const value = 0;

        storage.set('testNumber', value).pipe(
          mergeMap(() => storage.get('testNumber'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number const', (done) => {

        const value = 1.5;

        storage.set('testNumberConst', value).pipe(
          mergeMap(() => storage.get('testNumberConst'))
        ).subscribe((result: 1.5 | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number const without assertion', (done) => {

        const value = 1.5;

        storage.set('testNumberConst', value).pipe(
          mergeMap(() => storage.get('testNumberConst'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number enum', (done) => {

        const value = 2.4;

        storage.set('testNumberEnum', value).pipe(
          mergeMap(() => storage.get('testNumberEnum'))
        ).subscribe((result: 1.5 | 2.4 | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('number enum without assertion', (done) => {

        const value = 2.4;

        // TODO: if key is saved in a variable, must be a `const`(`let` won't work)
        storage.set('testNumberEnum', value).pipe(
          mergeMap(() => storage.get('testNumberEnum'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer', (done) => {

        const value = 1;

        storage.set('testInteger', value).pipe(
          mergeMap(() => storage.get('testInteger'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer zero', (done) => {

        const value = 0;

        storage.set('testInteger', value).pipe(
          mergeMap(() => storage.get('testInteger'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer const', (done) => {

        const value = 1;

        storage.set('testIntegerConst', value).pipe(
          mergeMap(() => storage.get('testIntegerConst'))
        ).subscribe((result: 1 | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer const without assertion', (done) => {

        const value = 1;

        storage.set('testIntegerConst', value).pipe(
          mergeMap(() => storage.get('testIntegerConst'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer enum', (done) => {

        const value = 2;

        storage.set('testIntegerEnum', value).pipe(
          mergeMap(() => storage.get('testIntegerEnum'))
        ).subscribe((result: 1 | 2 | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('integer enum without assertion', (done) => {

        const value = 2;

        storage.set('testIntegerEnum', value).pipe(
          mergeMap(() => storage.get('testIntegerEnum'))
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('boolean true', (done) => {

        const value = true;

        storage.set('testBoolean', value).pipe(
          mergeMap(() => storage.get('testBoolean'))
        ).subscribe((result: boolean | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('boolean false', (done) => {

        const value = false;

        storage.set('testBoolean', value).pipe(
          mergeMap(() => storage.get('testBoolean'))
        ).subscribe((result: boolean | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('boolean const', (done) => {

        const value = true;

        storage.set('testBooleanConst', value).pipe(
          mergeMap(() => storage.get('testBooleanConst'))
        ).subscribe((result: true | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('boolean const without assertion', (done) => {

        const value = true;

        storage.set('testBooleanConst', value).pipe(
          mergeMap(() => storage.get('testBooleanConst'))
        ).subscribe((result: boolean | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('array of strings', (done) => {

        const value = ['hello', 'world', '!'];

        storage.set('testArrayOfStrings', value).pipe(
          mergeMap(() => storage.get('testArrayOfStrings'))
        ).subscribe((result: string[] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('array of integers', (done) => {

        const value = [1, 2, 3];

        storage.set('testArrayOfIntegers', value).pipe(
          mergeMap(() => storage.get('testArrayOfIntegers'))
        ).subscribe((result: number[] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('array of numbers', (done) => {

        const value = [1.5, 2.4, 3.67];

        storage.set('testArrayOfNumbers', value).pipe(
          mergeMap(() => storage.get('testArrayOfNumbers'))
        ).subscribe((result: number[] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('array of booleans', (done) => {

        const value = [true, false, true];

        storage.set('testArrayOfBooleans', value).pipe(
          mergeMap(() => storage.get('testArrayOfBooleans'))
        ).subscribe((result: boolean[] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('array of arrays', (done) => {

        const value = [['hello', 'world'], ['my', 'name'], ['is', 'Elmo']];

        storage.set('testArrayOfArrays', value).pipe(
          mergeMap(() => storage.get('testArrayOfArrays'))
        ).subscribe((result: string[][] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('array of objects', (done) => {

        const value = [{
          name: 'Elmo',
          address: 'Sesame street',
        }, {
          name: 'Cookie',
        }, {
          name: 'Chester',
        }];

        storage.set('testArrayOfObjects', value).pipe(
          mergeMap(() => storage.get('testArrayOfObjects'))
        ).subscribe((result: Monster[] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('Set', (done) => {

        const value = new Set<string>(['hello', 'world']);

        storage.set('testSet', value).pipe(
          mergeMap(() => storage.get('testSet')),
        ).subscribe((result: Set<string> | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      // TODO: should be useless in TS 4.1
      // it('tuple with 1 value', (done) => {

      //   // TODO: documente, type required
      //   const value: [Monster] = [{
      //     name: 'Elmo',
      //     address:  'Sesame street',
      //   }];
      //   const schema = {
      //     type: 'array',
      //     items: [{
      //       type: 'object',
      //       properties: {
      //         name: { type: 'string' },
      //         address: { type: 'string' },
      //       },
      //       required: ['name'],
      //     }],
      //   } as const;

      //   storage.set(key, value, schema).pipe(
      //     mergeMap(() => storage.get(key, schema))
      //   ).subscribe((result: [Monster] | undefined) => {

      //     expect(result).toEqual(value);

      //     done();

      //   });

      // });

      it('tuple', (done) => {

        const value: [string, Monster] = ['hello', {
          name: 'Elmo',
          address: 'Sesame street',
        }];

        storage.set('testTuple', value).pipe(
          mergeMap(() => storage.get('testTuple'))
        ).subscribe((result: [string, Monster] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('tuple Map', (done) => {

        const array: [string, Monster][] = [
          ['Elmo', {
            name: 'Elmo',
            address: 'Sesame street',
          }],
          ['Cookie', {
            name: 'Cookie',
          }],
        ];
        const value = new Map<string, Monster>(array);

        storage.set('testMap', Array.from(value)).pipe(
          mergeMap(() => storage.get('testMap')),
        ).subscribe((result: [string, Monster][] | undefined) => {

          expect(result).toEqual(array);

          done();

        });

      });

      // TODO: should be useless with TS 4.1
      // it('tuple with 3 primitive values', (done) => {

      //   const value: [string, number, boolean] = ['hello', 2, true];
      //   const schema = {
      //     type: 'array',
      //     items: [
      //       { type: 'string' },
      //       { type: 'number' },
      //       { type: 'boolean' },
      //     ],
      //   } as const;

      //   storage.set(key, value, schema).pipe(
      //     mergeMap(() => storage.get(key, schema))
      //   ).subscribe((result: [string, number, boolean] | undefined) => {

      //     expect(result).toEqual(value);

      //     done();

      //   });

      // });

      // it('tuple with 3 complex values', (done) => {

      //   const value: [string, number, Monster] = ['hello', 2, {
      //     name: 'Elmo',
      //     address:  'Sesame street',
      //   }];
      //   const schema = {
      //     type: 'array',
      //     items: [
      //       { type: 'string' },
      //       { type: 'number' },
      //       {
      //         type: 'object',
      //         properties: {
      //           name: { type: 'string' },
      //           address: { type: 'string' },
      //         },
      //         required: ['name'],
      //       }
      //     ],
      //   } as const;

      //   storage.set(key, value, schema).pipe(
      //     mergeMap(() => storage.get(key, schema))
      //   ).subscribe((result: unknown[] | undefined) => {

      //     expect(result).toEqual(value);

      //     done();

      //   });

      // });

      it('object', (done) => {

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

        storage.set('testObject', value).pipe(
          mergeMap(() => storage.get('testObject'))
        ).subscribe((result: User | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('object without required properties', (done) => {

        interface User {
          name?: string;
          age?: number;
        }

        const value: User = {
          name: 'Henri Bergson',
        };

        storage.set('testObjectWithoutRequired', value).pipe(
          mergeMap(() => storage.get('testObjectWithoutRequired'))
        ).subscribe((result: User | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('object without const assertion', (done) => {

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

        storage.set('testObject', value).pipe(
          mergeMap(() => storage.get('testObject'))
        ).subscribe((result: Partial<User> | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

      it('unexisting key', (done) => {

        // @ts-expect-error
        storage.get(Date.now()).subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(DatabaseEntriesKeyError);
            done();
          },
        });

      });

      it('null', (done) => {

        storage.set('testString', 'test').pipe(
          mergeMap(() => storage.set('testString', null)),
          mergeMap(() => storage.get('testString')),
        ).subscribe((result: string | undefined) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('undefined', (done) => {

        storage.set('testString', 'test').pipe(
          mergeMap(() => storage.set('testString', undefined)),
          mergeMap(() => storage.get('testString')),
        ).subscribe((result: string | undefined) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('blob (will be pending in Safari private)', (done) => {

        const value = new Blob();

        storage.set('testBlob', value).pipe(
          mergeMap(() => storage.get('testBlob'))
        ).subscribe((storage.backingEngine === 'localStorage') ? {
          next: () => { },
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

        // @ts-expect-error
        storage.get('testBlob').subscribe((result: string | undefined) => {

          expect().nothing();

          done();

        });

      });

      /* Inference from JSON schema is quite heavy, so this is a stress test for the compiler */
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

        storage.set('testHeavy', value).pipe(
          mergeMap(() => storage.get('testHeavy')),
        ).subscribe((result: [string, City][] | undefined) => {

          expect(result).toEqual(value);

          done();

        });

      });

    });

    describe('write', () => {

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('set()', (done) => {

        storage.set('testString', 'value').pipe(
          mergeMap(() => storage.set('testString', 'updated'))
        ).subscribe(() => {

          expect().nothing();

          done();

        });

      });

      it('concurrency', (done) => {

        const value1 = 'test1';
        const value2 = 'test2';

        expect(() => {

          storage.set('testString', value1).subscribe();

          storage.set('testString', value2).pipe(
            mergeMap(() => storage.get('testString'))
          ).subscribe((result) => {

            expect(result).toBe(value2);

            done();

          });

        }).not.toThrow();

      });

      it('delete() with existing key', (done) => {

        storage.set('testString', 'test').pipe(
          mergeMap(() => storage.delete('testString')),
          mergeMap(() => storage.get('testString'))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

      it('delete() with unexisting key', (done) => {

        // @ts-expect-error
        storage.delete(Date.now()).subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(DatabaseEntriesKeyError);
            done();
          },
        });

        done();

      });

      it('clear()', (done) => {

        storage.set('testString', 'test').pipe(
          mergeMap(() => storage.clear()),
          mergeMap(() => storage.get('testString'))
        ).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });

      });

    });

    describe('Map-like API', () => {

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('size', (done) => {

        storage.size.pipe(
          tap((length) => { expect(length).toBe(0); }),
          mergeMap(() => storage.set('testString', 'test')),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => storage.set('testNumber', 1)),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(2); }),
          mergeMap(() => storage.delete('testString')),
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

        const key1 = 'testString';
        const key2 = 'testNumber';
        const keys = [key1, key2];

        storage.set(key1, 'test').pipe(
          mergeMap(() => storage.set(key2, 10)),
          mergeMap(() => storage.keys()),
        ).subscribe({
          next: (value) => {
            expect(keys).toContain(value);
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

      // TODO: should not be useful anymore
      // it('has() on existing', (done) => {

      //   const schema = { type: 'string' } as const;

      //   storage.set(key, 'test', schema).pipe(
      //     mergeMap(() => storage.has(key))
      //   ).subscribe((result) => {

      //     expect(result).toBe(true);

      //     done();

      //   });

      // });

      // it('has() on unexisting', (done) => {

      //   storage.has(`nokey${Date.now()}`).subscribe((result) => {

      //     expect(result).toBe(false);

      //     done();

      //   });

      // });

      it('advanced case: remove only some items', (done) => {

        storage.set('prefix1_data1', 'test').pipe(
          mergeMap(() => storage.set('prefix1_data2', 'test')),
          mergeMap(() => storage.set('prefix2_data1', 'test')),
          mergeMap(() => storage.set('prefix2_data2', 'test')),
          mergeMap(() => storage.keys()),
          filter((currentKey) => currentKey.startsWith('prefix2_')),
          // TODO: fix
          mergeMap((currentKey) => storage.delete(currentKey as keyof typeof dbSchema)),
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

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('valid', (done) => {

        const values = [undefined, 'test1', undefined, 'test2', undefined];
        let i = 0;
        let subscription: Subscription;

        subscription = storage.watch('testWatch').subscribe((result: string | undefined) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === 1) {

            storage.set('testWatch', values[1]).pipe(
              mergeMap(() => storage.delete('testWatch')),
              mergeMap(() => storage.set('testWatch', values[3])),
              mergeMap(() => storage.clear()),
            ).subscribe();

          }

          if (i === values.length) {
            subscription?.unsubscribe();
            done();
          }

        });

      });

    });

    describe('validation', () => {

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('valid schema with options', (done) => {

        const value = 5;

        storage.set('testSchema', value).pipe(
          mergeMap(() => storage.get('testSchema')),
        ).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });

      });

      it('invalid schema with options', (done) => {

        const value = 15;

        storage.set('testSchema', value).pipe(
          mergeMap(() => storage.get('testSchema')),
        ).subscribe({
          error: (error) => {

            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });

      });

      it('invalid in set()', (done) => {

        // @ts-expect-error
        storage.set('testNumber', 'test').subscribe({
          error: (error) => {

            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });

      });

      // TODO: validation is forced in SafeStorageMap, so testing this requires manual native storage manipulation
      // it('invalid in watch()', (done) => {

      //   const watchedKey = 'watched2';

      //   storage.set('watchedKey', 'test', { type: 'string' } as const).subscribe(() => {

      //     storage.watch(watchedKey, { type: 'number' } as const).subscribe({
      //       error: () => {
      //         expect().nothing();
      //         done();
      //       }
      //     });

      //   });

      // });

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
     * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe('complete', () => {

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('get()', (done) => {

        storage.get('testString').subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('set()', (done) => {

        storage.set('testString', 'value').subscribe({
          complete: () => {
            expect().nothing();
            done();
          }
        });

      });

      it('delete()', (done) => {

        storage.delete('testString').subscribe({
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

      // it('has()', (done) => {

      //   storage.has(key).subscribe({
      //     complete: () => {
      //       expect().nothing();
      //       done();
      //     }
      //   });

      // });

    });

    describe('compatibility with Promise', () => {

      beforeEach((done) => {
        /* Clear data to avoid tests overlap */
        clearStorage(done, storage);
      });

      it('Promise', (done) => {

        const value = 'test';

        storage.set('testString', value).toPromise()
          .then(() => storage.get('testString').toPromise())
          .then((result: string | undefined) => {
            expect(result).toBe(value);
            done();
          });

      });

      it('async / await', async () => {

        const value = 'test';

        await storage.set('testString', value).toPromise();

        const result: string | undefined = await storage.get('testString').toPromise();

        expect(result).toBe(value);

      });

    });

  });

}

describe('SafeStorageMap', () => {

  tests('memory', () => new SafeStorageMap(new MemoryDatabase(), dbSchema));

  tests('localStorage', () => new SafeStorageMap(new LocalStorageDatabase(), dbSchema));

  tests('localStorage with prefix', () => new SafeStorageMap(new LocalStorageDatabase(`ls`), dbSchema));

  tests('indexedDB', () => new SafeStorageMap(new IndexedDBDatabase(), dbSchema));

  tests('indexedDB with custom options', () => new SafeStorageMap(new IndexedDBDatabase('customDbTest', 'storeTest', 2, false), dbSchema));

  describe('browser APIs', () => {

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it('IndexedDb is used (will be pending in Firefox/IE private mode)', (done) => {

      const value = `${Date.now()}`;

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(), dbSchema);

      localStorageService.set('testString', value).subscribe(() => {

        try {

          const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION);

          dbOpen.addEventListener('success', () => {

            const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

            const request = store.get('testString');

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

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(), dbSchema);

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('testString').subscribe(() => {

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

      const value = `${Date.now()}`;

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(undefined, undefined, undefined, false), dbSchema);

      localStorageService.set('testString', value).subscribe(() => {

        try {

          const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION);

          dbOpen.addEventListener('success', () => {

            const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

            const request = store.get('testString');

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

      const localStorageService = new SafeStorageMap(new IndexedDBDatabase(dbName, storeName, dbVersion, noWrap), dbSchema);

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get('testString').subscribe(() => {

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

      const localStorageService = new SafeStorageMap(new LocalStorageDatabase(prefix), dbSchema);

      expect(localStorageService.fallbackBackingStore.prefix).toBe(prefix);

    });

  });

});
