import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestBed } from "@angular/core/testing";
import { String as StringType, Type, type Static } from "@sinclair/typebox";
import { firstValueFrom } from "rxjs";
import { filter, mergeMap, tap } from "rxjs/operators";
import { server } from 'vitest/browser';
import { IndexedDBDatabase } from "../databases/indexeddb-database";
import { LocalStorageDatabase } from "../databases/localstorage-database";
import { MemoryDatabase } from "../databases/memory-database";
import { provideIndexedDBDataBaseName, provideIndexedDBDataBaseVersion, provideIndexedDBStoreName, provideLocalStoragePrefix } from "../providers";
import { StorageModule } from "../storage.module";
import { clearStorage, closeAndDeleteDatabase } from "../testing/cleaning";
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION, DEFAULT_IDB_STORE_NAME } from "../tokens";
import type { JSONSchema } from "../validation/json-schema";
import { VALIDATION_ERROR } from "./exceptions";
import { StorageMap } from "./storage-map";

function tests(description: string, localStorageServiceFactory: () => StorageMap): void {

  interface Monster {
    readonly name: string;
    readonly address?: string;
  }

  const key = "test";
  let storage: StorageMap;

  describe(description, () => {

    beforeAll(() => {
      /* Via a factory as the class should be instancied only now, not before, otherwise tests could overlap */
      storage = localStorageServiceFactory();
    });

    afterAll(async () => {
      /* Now that `indexedDB` store name can be customized, it's important:
       * - to delete the database after each tests group,
       * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
       * as it's where the store is created
       * - to be able to delete the database, all connections to it must be closed */
      await closeAndDeleteDatabase(storage);
    });

    describe("overloads", () => {

      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      it("no schema / no cast", () => new Promise((done) => {

        // @ts-expect-error Failure test
        storage.get("test").subscribe((_: number | undefined) => {
          // Nothing to test
          done();
        });
      }));

      it("no schema / cast", () => new Promise((done) => {

        // @ts-expect-error Failure test
        storage.get<number>("test").subscribe((_: number | undefined) => {
          // Nothing to test
          done();
        });
      }));

      it("schema / cast", () => new Promise((done) => {

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
        storage.get<string>("test", { type: "string" }).subscribe((_: string | undefined) => {
          // Nothing to test
          done();
        });
      }));

      it("schema with options", () => new Promise((done) => {

        storage.get("test", { type: "number", maximum: 10 }).subscribe((_: number | undefined) => {
          // Nothing to test
          done();
        });
      }));

      it("prepared schema with generic interface", () => new Promise((done) => {

        const schema: JSONSchema = { type: "number" };

        storage.get("test", schema).subscribe((_: number | undefined) => {
          // Nothing to test
          done();
        });
      }));

      it("prepared schema with satisfies", () => new Promise((done) => {

        const schema = { type: "number" } satisfies JSONSchema;

        storage.get("test", schema).subscribe((_: number | undefined) => {
          // Nothing to test
          done();
        });
      }));

    });

    describe(`get()`, () => {

      describe(`string`, () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("with value", () => new Promise((done) => {

          const value = "blue";
          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("empty", () => new Promise((done) => {

          const value = "";
          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("const", () => new Promise((done) => {

          const value = "hello";
          const schema = {
            type: "string",
            const: "hello",
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<"hello">(key, schema))).subscribe((result: "hello" | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("enum", () => new Promise((done) => {

          const value = "world";
          const schema = {
            type: "string",
            enum: ["hello", "world"],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<"hello" | "world">(key, schema))).subscribe((result: "hello" | "world" | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

      });

      describe(`number`, () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("with value", () => new Promise((done) => {

          const value = 1.5;
          const schema = { type: "number" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("zero", () => new Promise((done) => {

          const value = 0;
          const schema = { type: "number" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("const", () => new Promise((done) => {

          const value = 1.5;
          const schema = {
            type: "number",
            const: 1.5,
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1.5>(key, schema))).subscribe((result: 1.5 | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("enum", () => new Promise((done) => {

          const value = 2.4;
          const schema = {
            type: "number",
            enum: [1.5, 2.4],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1.5 | 2.4>(key, schema))).subscribe((result: 1.5 | 2.4 | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

      });

      describe(`integer`, () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("with value", () => new Promise((done) => {

          const value = 1;
          const schema = { type: "integer" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("zero", () => new Promise((done) => {

          const value = 0;
          const schema = { type: "integer" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("const", () => new Promise((done) => {

          const value = 1;
          const schema = {
            type: "integer",
            const: 1,
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1>(key, schema))).subscribe((result: 1 | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("enum", () => new Promise((done) => {

          const value = 2;
          const schema = {
            type: "integer",
            enum: [1, 2],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1 | 2>(key, schema))).subscribe((result: 1 | 2 | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

      });

      describe(`boolean`, () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("true", () => new Promise((done) => {

          const value = true;
          const schema = { type: "boolean" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("false", () => new Promise((done) => {

          const value = false;
          const schema = { type: "boolean" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

        it("const", () => new Promise((done) => {

          const value = true;
          const schema = {
            type: "boolean",
            const: true,
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<true>(key, schema))).subscribe((result: true | undefined) => {

            expect(result).toBe(value);

            done();

          });
        }));

      });

      describe("array", () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("of strings", () => new Promise((done) => {

          const value = ["hello", "world", "!"];
          const schema = {
            type: "array",
            items: { type: "string" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: readonly string[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("of integers", () => new Promise((done) => {

          const value = [1, 2, 3];
          const schema = {
            type: "array",
            items: { type: "integer" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: readonly number[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("of numbers", () => new Promise((done) => {

          const value = [1.5, 2.4, 3.67];
          const schema = {
            type: "array",
            items: { type: "number" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: readonly number[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("of booleans", () => new Promise((done) => {

          const value = [true, false, true];
          const schema = {
            type: "array",
            items: { type: "boolean" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get(key, schema))
          ).subscribe((result: readonly boolean[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("of arrays", () => new Promise((done) => {

          const value = [["hello", "world"], ["my", "name"], ["is", "Elmo"]];
          const schema = {
            type: "array",
            items: {
              type: "array",
              items: { type: "string" },
            },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<string[][]>(key, schema))
          ).subscribe((result: readonly (readonly string[])[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("of objects", () => new Promise((done) => {

          const value = [{
            name: "Elmo",
            address: "Sesame street",
          }, {
            name: "Cookie",
          }, {
            name: "Chester",
          }];
          const schema = {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
              },
              required: ["name"],
            },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<Monster[]>(key, schema))
          ).subscribe((result: readonly Monster[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("Set", () => new Promise((done) => {

          const array = ["hello", "world"];
          const value = new Set<string>(["hello", "world"]);
          const schema = {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          } satisfies JSONSchema;

          storage.set(key, Array.from(value), schema).pipe(
            mergeMap(() => storage.get(key, schema)),
          ).subscribe((result: readonly string[] | undefined) => {

            expect(result).toEqual(array);

            done();

          });
        }));

        it("tuple", () => new Promise((done) => {

          const value: [
            string,
            Monster
          ] = ["hello", {
            name: "Elmo",
            address: "Sesame street",
          }];
          const schema = {
            type: "array",
            items: [{
              type: "string"
            }, {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
              },
              required: ["name"],
            }],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<[string, Monster]>(key, schema))
          ).subscribe((result: readonly [string, Monster] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("Map", () => new Promise((done) => {

          const array: [
            string,
            Monster
          ][] = [
              ["Elmo", {
                name: "Elmo",
                address: "Sesame street",
              }],
              ["Cookie", {
                name: "Cookie",
              }],
            ];
          const value = new Map<string, Monster>(array);
          const schema = {
            type: "array",
            items: {
              type: "array",
              items: [{
                type: "string"
              }, {
                type: "object",
                properties: {
                  name: { type: "string" },
                  address: { type: "string" },
                },
                required: ["name"],
              }],
            },
          } satisfies JSONSchema;

          storage.set(key, Array.from(value), schema).pipe(
            mergeMap(() => storage.get<[string, Monster][]>(key, schema)),
          ).subscribe((result: readonly (readonly [string, Monster])[] | undefined) => {

            expect(result).toEqual(array);

            done();

          });
        }));

      });

      describe("object", () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("with all subtypes", () => new Promise((done) => {

          interface User {
            readonly name: string;
            readonly age: number;
            readonly philosopher: boolean;
            readonly books: readonly string[];
            readonly family: {
              readonly brothers: number;
              readonly sisters: number;
            };
            readonly creditCard?: number;
          }

          const value: User = {
            name: "Henri Bergson",
            age: 81,
            philosopher: true,
            books: [`Essai sur les données immédiates de la conscience`, `Matière et mémoire`],
            family: {
              brothers: 5,
              sisters: 3,
            },
          };
          const schema = {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
              philosopher: { type: "boolean" },
              books: {
                type: "array",
                items: { type: "string" },
              },
              family: {
                type: "object",
                properties: {
                  brothers: { type: "integer" },
                  sisters: { type: "integer" },
                },
                required: ["brothers", "sisters"]
              },
              creditCard: { type: "number" },
            },
            required: ["name", "age", "philosopher", "books", "family"],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<User>(key, schema))).subscribe((result: User | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("without required properties", () => new Promise((done) => {

          interface User {
            readonly name?: string;
            readonly age?: number;
          }

          const value: User = {
            name: "Henri Bergson",
          };
          const schema = {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "number" },
            },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<User>(key, schema))).subscribe((result: User | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

        it("objects / cast / no schema", () => new Promise((done) => {

          interface Test {
            readonly test: string;
          }

          // @ts-expect-error Failure test
          storage.get<Test>("test").subscribe((_: Test | undefined) => {
            // Nothing to test
            done();
          });
        }));

        it("objects / no cast / schema", () => new Promise((done) => {

          interface Test {
            readonly test: string;
          }

          storage.get("test", {
            type: "object",
            properties: {
              test: { type: "string" }
            }
            // @ts-expect-error Failure test
          }).subscribe((_: Test) => {
            // Nothing to test
            done();
          });
        }));

      });

      describe("specials", () => {
        beforeEach(async () => {
          /* Clear data to avoid tests overlap */
          await clearStorage(storage);
        });

        it("unexisting key", () => new Promise((done) => {

          const schema = { type: "string" } satisfies JSONSchema;

          storage.get(`unknown${Date.now().toFixed()}`, schema).subscribe((data: string | undefined) => {

            expect(data).toBeUndefined();

            done();

          });
        }));

        it("null", () => new Promise((done) => {

          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, "test", schema).pipe(mergeMap(() => storage.set(key, null, schema)), mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

            done();

          });
        }));

        it("undefined", () => new Promise((done) => {

          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, "test", schema).pipe(mergeMap(() => storage.set(key, undefined, schema)), mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

            done();

          });
        }));

        it.skipIf(server.browser === 'webkit')("blob (will be pending in Safari private)", (context) => new Promise((done) => {

          const value = new Blob();

          storage.set(key, value).pipe(
            mergeMap(() => storage.get(key))
          ).subscribe((storage.backingEngine === "localStorage") ? {
            next: (): void => {},
            error: (): void => {
              done();
              return;
            }
          } : {
            next: (result: unknown): void => {
              expect(result).toEqual(value);
              done();
            },
            error: (): void => {
              context.skip();
            }
          });

        }));

        it("heavy schema", () => new Promise((done) => {

          interface City {
            readonly country: string;
            readonly population: number;
            readonly coordinates: readonly [number, number];
            readonly monuments?: readonly {
              readonly name: string;
              readonly constructionYear?: number;
            }[];
          }

          const value: [
            string,
            City
          ][] = [
              ["Paris", {
                country: "France",
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
              ["Kyōto", {
                country: "Japan",
                population: 1467702,
                coordinates: [35.011665, 135.768326],
                monuments: [{
                  name: `Sanjūsangen-dō`,
                  constructionYear: 1164,
                }],
              }],
            ];

          const schema = {
            type: "array",
            items: {
              type: "array",
              items: [{
                type: "string"
              }, {
                type: "object",
                properties: {
                  country: { type: "string" },
                  population: { type: "integer" },
                  coordinates: {
                    type: "array",
                    items: [
                      { type: "number" },
                      { type: "number" },
                    ],
                  },
                  monuments: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        constructionYear: { type: "integer" },
                      },
                      required: ["name"],
                    },
                  },
                },
                required: ["country", "population", "coordinates"],
              }]
            },
          } satisfies JSONSchema;


          storage.set(key, value, schema).pipe(
            mergeMap(() => storage.get<[string, City][]>(key, schema)),
          ).subscribe((result: readonly (readonly [string, City])[] | undefined) => {

            expect(result).toEqual(value);

            done();

          });
        }));

      });

    });

    describe("set()", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      it("update", () => new Promise((done) => {

        const schema = { type: "string" } satisfies JSONSchema;

        storage.set(key, "value", schema).pipe(mergeMap(() => storage.set(key, "updated", schema))).subscribe(() => {
          // Nothing to test
          done();
        });
      }));

      it("concurrency", () => new Promise((done) => {

        const value1 = "test1";
        const value2 = "test2";
        const schema = { type: "string" } satisfies JSONSchema;

        expect(() => {

          storage.set(key, value1, schema).subscribe();

          storage.set(key, value2, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result) => {

            expect(result).toBe(value2);

            done();

          });

        }).not.toThrow();
      }));

    });

    describe("deletion", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      it("delete() with existing key", async () => new Promise((done) => {

        storage.set(key, "test").pipe(mergeMap(() => storage.delete(key)), mergeMap(() => storage.get(key))).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });
      }));

      it("delete() with unexisting key", () => new Promise((done) => {

        storage.delete(`unexisting${Date.now().toFixed()}`).subscribe(() => {
          // Nothing to test
          done();
        });
      }));

      it("clear()", () => new Promise((done) => {

        storage.set(key, "test").pipe(mergeMap(() => storage.clear()), mergeMap(() => storage.get(key))).subscribe((result) => {

          expect(result).toBeUndefined();

          done();

        });
      }));

    });

    describe("Map-like API", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      it("size", () => new Promise((done) => {
        storage.size.pipe(
          tap((length) => { expect(length).toBe(0); }),
          mergeMap(() => storage.set(key, "test")),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => storage.set("", "test")),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(2); }),
          mergeMap(() => storage.delete(key)),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(1); }),
          mergeMap(() => storage.clear()),
          mergeMap(() => storage.size),
          tap((length) => { expect(length).toBe(0); })
        ).subscribe(() => {
          done();
        });
      }));

      it("keys()", () => new Promise((done) => {

        const key1 = "index1";
        const key2 = "index2";
        const keys = [key1, key2];

        storage.set(key1, "test").pipe(mergeMap(() => storage.set(key2, "test")), mergeMap(() => storage.keys())).subscribe({
          next: (value) => {
            expect(keys).toContain(value);
            keys.splice(keys.indexOf(value), 1);
          },
          complete: () => {
            done();
          },
        });
      }));

      it("keys() when no items", () => new Promise((done) => {

        storage.keys().subscribe({
          next: () => {
            throw new Error();
          },
          complete: () => {
            // Nothing to test
            done();
          },
        });
      }));

      it("has() on existing", () => new Promise((done) => {

        storage.set(key, "test").pipe(mergeMap(() => storage.has(key))).subscribe((result) => {

          expect(result).toBe(true);

          done();

        });
      }));

      it("has() on unexisting", () => new Promise((done) => {

        storage.has(`nokey${Date.now().toFixed()}`).subscribe((result) => {

          expect(result).toBe(false);

          done();

        });
      }));

      it("advanced case: remove only some items", () => new Promise((done) => {

        storage.set("user_firstname", "test").pipe(mergeMap(() => storage.set("user_lastname", "test")), mergeMap(() => storage.set("app_data1", "test")), mergeMap(() => storage.set("app_data2", "test")), mergeMap(() => storage.keys()), filter((currentKey) => currentKey.startsWith("app_")), mergeMap((currentKey) => storage.delete(currentKey))).subscribe({
          /* So we need to wait for completion of all actions to check */
          complete: () => {

            // // eslint-disable-next-line rxjs/no-nested-subscribe
            storage.size.subscribe((size) => {

              expect(size).toBe(2);

              done();

            });

          }
        });
      }));

    });

    describe("watch()", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      it("valid", () => new Promise((done) => {

        const watchedKey = "watched1";
        const values = [undefined, "test1", undefined, "test2", undefined];
        const schema = { type: "string" } satisfies JSONSchema;
        let i = 0;

        storage.watch(watchedKey, schema).subscribe((result: string | undefined) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === values.length) {
            done();
          }

        });

        storage.set(watchedKey, values[1], schema).pipe(
          mergeMap(() => storage.delete(watchedKey)),
          mergeMap(() => storage.set(watchedKey, values[3], schema)),
          mergeMap(() => storage.clear())
        ).subscribe();
      }));

    });

    describe("validation", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      interface Test {
        expected: string;
      }

      const schema = {
        type: "object",
        properties: {
          expected: {
            type: "string"
          }
        },
        required: ["expected"]
      } satisfies JSONSchema;

      it("valid schema with options", () => new Promise((done) => {

        const value = 5;
        const schemaWithOptions = { type: "number", maximum: 10 } satisfies JSONSchema;

        storage.set(key, value, schemaWithOptions).pipe(mergeMap(() => storage.get(key, schemaWithOptions))).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });
      }));

      it("invalid schema with options", () => new Promise((done) => {

        const value = 15;
        const schemaWithOptions = { type: "number", maximum: 10 } satisfies JSONSchema;

        storage.set(key, value, { type: "number" }).pipe(mergeMap(() => storage.get(key, schemaWithOptions))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });
      }));

      it("invalid in get()", () => new Promise((done) => {

        storage.set(key, "test", { type: "string" }).pipe(mergeMap(() => storage.get<Test>(key, schema))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });
      }));

      it("invalid in set()", () => new Promise((done) => {

        storage.set(key, "test", schema).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          },
        });
      }));

      it("invalid in watch()", () => new Promise((done) => {

        const watchedKey = "watched2";

        storage.set(watchedKey, "test", { type: "string" }).subscribe(() => {

          // // eslint-disable-next-line rxjs/no-nested-subscribe
          storage.watch(watchedKey, { type: "number" }).subscribe({
            error: () => {
              // Nothing to test
              done();
            }
          });

        });
      }));

      it("null: no validation", () => new Promise((done) => {

        storage.get<string>(`noassociateddata${Date.now().toFixed()}`, schema).subscribe(() => {
          // Nothing to test
          done();
        });
      }));

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
     * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe("complete", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      const schema = { type: "string" } satisfies JSONSchema;

      it("get()", () => new Promise((done) => {

        storage.get(key, schema).subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

      it("set()", () => new Promise((done) => {

        storage.set("index", "value", schema).subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

      it("delete()", () => new Promise((done) => {

        storage.delete(key).subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

      it("clear()", () => new Promise((done) => {

        storage.clear().subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

      it("size", () => new Promise((done) => {

        storage.size.subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

      it("keys()", () => new Promise((done) => {

        storage.keys().subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

      it("has()", () => new Promise((done) => {

        storage.has(key).subscribe({
          complete: () => {
            // Nothing to test
            done();
          }
        });
      }));

    });

    describe("compatibility with @sinclair/typebox", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      it("invalid", () => new Promise((done) => {

        storage.set(key, "test", Type.String()).pipe(mergeMap(() => storage.get(key, Type.Number()))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });
      }));

      it("invalid with options", () => new Promise((done) => {

        storage.set(key, "test", Type.String()).pipe(mergeMap(() => storage.get(key, Type.String({
          maxLength: 1,
        })))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

            done();

          }
        });
      }));

      it("string", () => new Promise((done) => {

        const value = "blue";
        const schema = Type.String();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });
      }));

      it("string (standalone import)", () => new Promise((done) => {

        const value = "blue";
        const schema = StringType();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });
      }));

      it("number", () => new Promise((done) => {

        const value = 1.5;
        const schema = Type.Number();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          done();

        });
      }));

      it("boolean", () => new Promise((done) => {

        const value = true;
        const schema = Type.Boolean();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean | undefined) => {

          expect(result).toBe(value);

          done();

        });
      }));

      it("array", () => new Promise((done) => {

        const value = ["hello 1", "hello 2"];
        const schema = Type.Array(Type.String());

        storage.set(key, value, schema).pipe(
          mergeMap(() => storage.get(key, schema))
        ).subscribe((result: readonly string[] | undefined) => {

          expect(result).toEqual(value);

          done();

        });
      }));

      it("tuple", () => new Promise((done) => {

        const value: [
          string,
          Monster
        ] = ["hello", {
          name: "Elmo",
          address: "Sesame street",
        }];
        const schema = Type.Tuple([
          Type.String(),
          Type.Object({
            name: Type.String(),
            address: Type.Optional(Type.String()),
          })
        ]);

        storage.set(key, value, schema).pipe(
          mergeMap(() => storage.get<[string, Monster]>(key, schema))
        ).subscribe((result: readonly [string, Monster] | undefined) => {

          expect(result).toEqual(value);

          done();

        });
      }));

      it("object", () => new Promise((done) => {

        interface User {
          readonly name: string;
          readonly age: number;
          readonly philosopher: boolean;
          readonly books: readonly string[];
          readonly family: {
            readonly brothers: number;
            readonly sisters: number;
          };
          readonly creditCard?: number;
        }

        const value: User = {
          name: "Henri Bergson",
          age: 81,
          philosopher: true,
          books: [`Essai sur les données immédiates de la conscience`, `Matière et mémoire`],
          family: {
            brothers: 5,
            sisters: 3,
          },
        };

        const schema = Type.Object({
          name: Type.String(),
          age: Type.Number(),
          philosopher: Type.Boolean(),
          books: Type.Array(Type.String()),
          family: Type.Object({
            brothers: Type.Integer(),
            sisters: Type.Integer(),
          }),
          creditCard: Type.Optional(Type.Number()),
        });

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get<Static<typeof schema>>(key, schema))).subscribe((result: User | undefined) => {

          expect(result).toEqual(value);

          done();

        });
      }));

      it("with options", () => new Promise((done) => {

        const value = "blue";
        const schema = Type.String({
          maxLength: 10,
        });

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          done();

        });
      }));

    });

    describe("compatibility with Promise", () => {
      beforeEach(async () => {
        /* Clear data to avoid tests overlap */
        await clearStorage(storage);
      });

      const schema = { type: "string" } satisfies JSONSchema;

      it("Promise", () => new Promise((done, reject) => {

        const value = "test";

        firstValueFrom(storage.set(key, value, schema))
          .then(() => firstValueFrom(storage.get(key, schema)))
          .then((result: string | undefined) => {
            expect(result).toBe(value);
            done();
          })
          .catch(() => {
            reject(new Error());
          });
      }));

      it("async / await", async () => {

        const value = "test";

        await firstValueFrom(storage.set(key, value, schema));

        const result: string | undefined = await firstValueFrom(storage.get(key, schema));

        expect(result).toBe(value);

      });

    });

  });

}

describe("StorageMap", () => {

  tests("memory", () => new StorageMap(new MemoryDatabase()));

  tests("localStorage", () => {
    TestBed.resetTestingModule();
    return new StorageMap(TestBed.inject(LocalStorageDatabase));
  });

  tests("localStorage with prefix", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideLocalStoragePrefix("ls")],
    });
    return new StorageMap(TestBed.inject(LocalStorageDatabase));
  });

  tests("indexedDB", () => {
    TestBed.resetTestingModule();
    return new StorageMap(TestBed.inject(IndexedDBDatabase));
  });

  tests("indexedDB with custom options", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideIndexedDBDataBaseName("customDbTest"),
        provideIndexedDBStoreName("storeTest"),
        provideIndexedDBDataBaseVersion(2),
      ],
    });
    return new StorageMap(TestBed.inject(LocalStorageDatabase));
  });

  describe("browser APIs", () => {

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it("IndexedDb is used", (context) => new Promise((done, reject) => {

      const index = `test${Date.now().toFixed()}`;
      const value = "test";

      TestBed.resetTestingModule();
      const localStorageService = new StorageMap(TestBed.inject(IndexedDBDatabase));

      localStorageService.set(index, value).subscribe(() => {

        try {

          const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION);

          dbOpen.addEventListener("success", () => {

            const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], "readonly").objectStore(DEFAULT_IDB_STORE_NAME);

            const request = store.get(index);

            request.addEventListener("success", () => {

              expect(request.result).toBe(value);

              dbOpen.result.close();

              closeAndDeleteDatabase(localStorageService).then(() => {
                done();
              }).catch(() => {
                reject(new Error());
              });

            });

            request.addEventListener("error", () => {

              dbOpen.result.close();

              /* This case is not supposed to happen */
              reject(new Error());

            });

          });

        }
        catch {
          context.skip();
        }

      });

    }));

    it("indexedDb with default options", () => new Promise((done, reject) => {

      TestBed.resetTestingModule();
      const localStorageService = new StorageMap(TestBed.inject(IndexedDBDatabase));

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get("test").subscribe(() => {

        const { database, store, version } = localStorageService.backingStore;

        expect(database).toBe(DEFAULT_IDB_DB_NAME);
        expect(store).toBe(DEFAULT_IDB_STORE_NAME);
        expect(version).toBe(DEFAULT_IDB_DB_VERSION);

        closeAndDeleteDatabase(localStorageService).then(() => {
          done();
        }).catch(() => {
          reject(new Error());
        });

      });

    }));

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it("indexedDb with noWrap to false", (context) => new Promise((done, reject) => {

      const index = `wrap${Date.now().toFixed()}`;
      const value = "test";

      TestBed.configureTestingModule({
        imports: [
          StorageModule.forRoot({ IDBNoWrap: false }),
        ],
      });

      const localStorageService = new StorageMap(TestBed.inject(IndexedDBDatabase));

      localStorageService.set(index, value).subscribe(() => {

        try {

          const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME, DEFAULT_IDB_DB_VERSION);

          dbOpen.addEventListener("success", () => {

            const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], "readonly").objectStore(DEFAULT_IDB_STORE_NAME);

            const request = store.get(index);

            request.addEventListener("success", () => {

              expect(request.result).toEqual({ value });

              dbOpen.result.close();

              closeAndDeleteDatabase(localStorageService).then(() => {
                done();
              }).catch(() => {
                reject(new Error());
              });

            });

            request.addEventListener("error", () => {

              dbOpen.result.close();

              /* This case is not supposed to happen */
              reject(new Error());

            });

          });

        }
        catch {
          context.skip();
        }

      });

    }));

    it("indexedDb with custom options", () => new Promise((done, reject) => {

      /* Unique names to be sure `indexedDB` `upgradeneeded` event is triggered */
      const dbName = `dbCustom${Date.now().toFixed()}`;
      const storeName = `storeCustom${Date.now().toFixed()}`;
      const dbVersion = 2;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideIndexedDBDataBaseName(dbName),
          provideIndexedDBStoreName(storeName),
          provideIndexedDBDataBaseVersion(dbVersion),
        ],
      });

      const localStorageService = new StorageMap(TestBed.inject(IndexedDBDatabase));

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get("test").subscribe(() => {

        const { database, store, version } = localStorageService.backingStore;

        expect(database).toBe(dbName);
        expect(store).toBe(storeName);
        expect(version).toBe(dbVersion);

        closeAndDeleteDatabase(localStorageService).then(() => {
          done();
        }).catch(() => {
          reject(new Error());
        });

      });

    }));

    it("localStorage with prefix", () => {

      const prefix = `ls_`;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideLocalStoragePrefix(prefix),
        ],
      });

      const localStorageService = new StorageMap(TestBed.inject(LocalStorageDatabase));

      expect(localStorageService.fallbackBackingStore.prefix).toBe(prefix);

    });

  });

});
