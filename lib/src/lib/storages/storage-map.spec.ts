import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestBed } from "@angular/core/testing";
import { String as StringType, Type, type Static } from "@sinclair/typebox";
import { firstValueFrom } from "rxjs";
import { filter, mergeMap, tap } from "rxjs/operators";
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
    name: string;
    address?: string;
  }

  const key = "test";
  let storage: StorageMap;

  describe(description, () => {

    beforeAll(() => {
      /* Via a factory as the class should be instancied only now, not before, otherwise tests could overlap */
      storage = localStorageServiceFactory();
    });

    beforeEach(() => new Promise(done => {
      /* Clear data to avoid tests overlap */
      clearStorage(done, storage);
    }));

    afterAll(() => new Promise(done => {
      /* Now that `indexedDB` store name can be customized, it's important:
       * - to delete the database after each tests group,
       * so the next tests group to will trigger the `indexedDB` `upgradeneeded` event,
       * as it's where the store is created
       * - to be able to delete the database, all connections to it must be closed */
      closeAndDeleteDatabase(done, storage);
    }));

    describe("overloads", () => {

      it("no schema / no cast", () => {

        // @ts-expect-error Failure test
        storage.get("test").subscribe((_: number | undefined) => {
          // Nothing to test
        });
      });

      it("no schema / cast", () => {

        // @ts-expect-error Failure test
        storage.get<number>("test").subscribe((_: number | undefined) => {
          // Nothing to test
        });
      });

      it("schema / cast", () => {

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
        storage.get<string>("test", { type: "string" }).subscribe((_: string | undefined) => {
          // Nothing to test
        });
      });

      it("schema with options", () => {

        storage.get("test", { type: "number", maximum: 10 }).subscribe((_: number | undefined) => {
          // Nothing to test
        });
      });

      it("prepared schema with generic interface", () => {

        const schema: JSONSchema = { type: "number" };

        storage.get("test", schema).subscribe((_: number | undefined) => {
          // Nothing to test
        });
      });

      it("prepared schema with satisfies", () => {

        const schema = { type: "number" } satisfies JSONSchema;

        storage.get("test", schema).subscribe((_: number | undefined) => {
          // Nothing to test
        });
      });

    });

    describe(`get()`, () => {

      describe(`string`, () => {

        it("with value", () => {

          const value = "blue";
          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("empty", () => {

          const value = "";
          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("const", () => {

          const value = "hello";
          const schema = {
            type: "string",
            const: "hello",
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<"hello">(key, schema))).subscribe((result: "hello" | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("enum", () => {

          const value = "world";
          const schema = {
            type: "string",
            enum: ["hello", "world"],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<"hello" | "world">(key, schema))).subscribe((result: "hello" | "world" | undefined) => {

            expect(result).toBe(value);

          });
        });

      });

      describe(`number`, () => {

        it("with value", () => {

          const value = 1.5;
          const schema = { type: "number" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("zero", () => {

          const value = 0;
          const schema = { type: "number" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("const", () => {

          const value = 1.5;
          const schema = {
            type: "number",
            const: 1.5,
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1.5>(key, schema))).subscribe((result: 1.5 | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("enum", () => {

          const value = 2.4;
          const schema = {
            type: "number",
            enum: [1.5, 2.4],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1.5 | 2.4>(key, schema))).subscribe((result: 1.5 | 2.4 | undefined) => {

            expect(result).toBe(value);

          });
        });

      });

      describe(`integer`, () => {

        it("with value", () => {

          const value = 1;
          const schema = { type: "integer" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("zero", () => {

          const value = 0;
          const schema = { type: "integer" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("const", () => {

          const value = 1;
          const schema = {
            type: "integer",
            const: 1,
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1>(key, schema))).subscribe((result: 1 | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("enum", () => {

          const value = 2;
          const schema = {
            type: "integer",
            enum: [1, 2],
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<1 | 2>(key, schema))).subscribe((result: 1 | 2 | undefined) => {

            expect(result).toBe(value);

          });
        });

      });

      describe(`boolean`, () => {

        it("true", () => {

          const value = true;
          const schema = { type: "boolean" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("false", () => {

          const value = false;
          const schema = { type: "boolean" } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean | undefined) => {

            expect(result).toBe(value);

          });
        });

        it("const", () => {

          const value = true;
          const schema = {
            type: "boolean",
            const: true,
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<true>(key, schema))).subscribe((result: true | undefined) => {

            expect(result).toBe(value);

          });
        });

      });

      describe("array", () => {

        it("of strings", () => {

          const value = ["hello", "world", "!"];
          const schema = {
            type: "array",
            items: { type: "string" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string[] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("of integers", () => {

          const value = [1, 2, 3];
          const schema = {
            type: "array",
            items: { type: "integer" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number[] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("of numbers", () => {

          const value = [1.5, 2.4, 3.67];
          const schema = {
            type: "array",
            items: { type: "number" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number[] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("of booleans", () => {

          const value = [true, false, true];
          const schema = {
            type: "array",
            items: { type: "boolean" },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean[] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("of arrays", () => {

          const value = [["hello", "world"], ["my", "name"], ["is", "Elmo"]];
          const schema = {
            type: "array",
            items: {
              type: "array",
              items: { type: "string" },
            },
          } satisfies JSONSchema;

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<string[][]>(key, schema))).subscribe((result: string[][] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("of objects", () => {

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

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<Monster[]>(key, schema))).subscribe((result: Monster[] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("Set", () => {

          const array = ["hello", "world"];
          const value = new Set<string>(["hello", "world"]);
          const schema = {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          } satisfies JSONSchema;

          storage.set(key, Array.from(value), schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string[] | undefined) => {

            expect(result).toEqual(array);

          });
        });

        it("tuple", () => {

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

          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<[
            string,
            Monster
          ]>(key, schema))).subscribe((result: [
            string,
            Monster
          ] | undefined) => {

            expect(result).toEqual(value);

          });
        });

        it("Map", () => {

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

          storage.set(key, Array.from(value), schema).pipe(mergeMap(() => storage.get<[
            string,
            Monster
          ][]>(key, schema))).subscribe((result: [
            string,
            Monster
          ][] | undefined) => {

            expect(result).toEqual(array);

          });
        });

      });

      describe("object", () => {

        it("with all subtypes", () => {

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

          });
        });

        it("without required properties", () => {

          interface User {
            name?: string;
            age?: number;
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

          });
        });

        it("objects / cast / no schema", () => {

          interface Test {
            test: string;
          }

          // @ts-expect-error Failure test
          storage.get<Test>("test").subscribe((_: Test | undefined) => {
            // Nothing to test
          });
        });

        it("objects / no cast / schema", () => {

          interface Test {
            test: string;
          }

          storage.get("test", {
            type: "object",
            properties: {
              test: { type: "string" }
            }
            // @ts-expect-error Failure test
          }).subscribe((_: Test) => {
            // Nothing to test
          });
        });

      });

      describe("specials", () => {

        it("unexisting key", () => {

          const schema = { type: "string" } satisfies JSONSchema;

          storage.get(`unknown${Date.now().toFixed()}`, schema).subscribe((data: string | undefined) => {

            expect(data).toBeUndefined();

          });
        });

        it("null", () => {

          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, "test", schema).pipe(mergeMap(() => storage.set(key, null, schema)), mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

          });
        });

        it("undefined", () => {

          const schema = { type: "string" } satisfies JSONSchema;

          storage.set(key, "test", schema).pipe(mergeMap(() => storage.set(key, undefined, schema)), mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

            expect(result).toBeUndefined();

          });
        });

        it("blob (will be pending in Safari private)", (context) => new Promise(done => {

          const value = new Blob();

          storage.set(key, value).pipe(mergeMap(() => storage.get(key))).subscribe((storage.backingEngine === "localStorage") ? {
            next: (): void => {
              // Nothing to do
            },
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

        it("heavy schema", () => {

          interface City {
            country: string;
            population: number;
            coordinates: [
              number,
              number
            ];
            monuments?: {
              name: string;
              constructionYear?: number;
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


          storage.set(key, value, schema).pipe(mergeMap(() => storage.get<[
            string,
            City
          ][]>(key, schema))).subscribe((result: [
            string,
            City
          ][] | undefined) => {

            expect(result).toEqual(value);

          });
        });

      });

    });

    describe("set()", () => {

      it("update", () => {

        const schema = { type: "string" } satisfies JSONSchema;

        storage.set(key, "value", schema).pipe(mergeMap(() => storage.set(key, "updated", schema))).subscribe(() => {
          // Nothing to test
        });
      });

      it("concurrency", () => {

        const value1 = "test1";
        const value2 = "test2";
        const schema = { type: "string" } satisfies JSONSchema;

        expect(() => {

          storage.set(key, value1, schema).subscribe();

          storage.set(key, value2, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result) => {

            expect(result).toBe(value2);

          });

        }).not.toThrow();
      });

    });

    describe("deletion", () => {

      it("delete() with existing key", () => {

        storage.set(key, "test").pipe(mergeMap(() => storage.delete(key)), mergeMap(() => storage.get(key))).subscribe((result) => {

          expect(result).toBeUndefined();

          ;

        });
      });

      it("delete() with unexisting key", () => {

        storage.delete(`unexisting${Date.now().toFixed()}`).subscribe(() => {
          // Nothing to test
        });
      });

      it("clear()", () => {

        storage.set(key, "test").pipe(mergeMap(() => storage.clear()), mergeMap(() => storage.get(key))).subscribe((result) => {

          expect(result).toBeUndefined();

          ;

        });
      });

    });

    describe("Map-like API", () => {

      it("size", () => {

        storage.size.pipe(tap((length) => { expect(length).toBe(0); }), mergeMap(() => storage.set(key, "test")), mergeMap(() => storage.size), tap((length) => { expect(length).toBe(1); }), mergeMap(() => storage.set("", "test")), mergeMap(() => storage.size), tap((length) => { expect(length).toBe(2); }), mergeMap(() => storage.delete(key)), mergeMap(() => storage.size), tap((length) => { expect(length).toBe(1); }), mergeMap(() => storage.clear()), mergeMap(() => storage.size), tap((length) => { expect(length).toBe(0); })).subscribe(() => {
          ;
        });
      });

      it("keys()", () => {

        const key1 = "index1";
        const key2 = "index2";
        const keys = [key1, key2];

        storage.set(key1, "test").pipe(mergeMap(() => storage.set(key2, "test")), mergeMap(() => storage.keys())).subscribe({
          next: (value) => {
            expect(keys).toContain(value);
            keys.splice(keys.indexOf(value), 1);
          },
          complete: () => {
            ;
          },
        });
      });

      it("keys() when no items", () => {

        storage.keys().subscribe({
          next: () => {
            throw new Error();
          },
          complete: () => {
            // Nothing to test
          },
        });
      });

      it("has() on existing", () => {

        storage.set(key, "test").pipe(mergeMap(() => storage.has(key))).subscribe((result) => {

          expect(result).toBe(true);

          ;

        });
      });

      it("has() on unexisting", () => {

        storage.has(`nokey${Date.now().toFixed()}`).subscribe((result) => {

          expect(result).toBe(false);

          ;

        });
      });

      it("advanced case: remove only some items", () => {

        storage.set("user_firstname", "test").pipe(mergeMap(() => storage.set("user_lastname", "test")), mergeMap(() => storage.set("app_data1", "test")), mergeMap(() => storage.set("app_data2", "test")), mergeMap(() => storage.keys()), filter((currentKey) => currentKey.startsWith("app_")), mergeMap((currentKey) => storage.delete(currentKey))).subscribe({
          /* So we need to wait for completion of all actions to check */
          complete: () => {

            // // eslint-disable-next-line rxjs/no-nested-subscribe
            storage.size.subscribe((size) => {

              expect(size).toBe(2);

              ;

            });

          }
        });
      });

    });

    describe("watch()", () => {

      it("valid", () => {

        const watchedKey = "watched1";
        const values = [undefined, "test1", undefined, "test2", undefined];
        const schema = { type: "string" } satisfies JSONSchema;
        let i = 0;

        storage.watch(watchedKey, schema).subscribe((result: string | undefined) => {

          expect(result).toBe(values[i]);

          i += 1;

          if (i === values.length) {
            ;
          }

        });

        storage.set(watchedKey, values[1], schema).pipe(mergeMap(() => storage.delete(watchedKey)), mergeMap(() => storage.set(watchedKey, values[3], schema)), mergeMap(() => storage.clear())).subscribe();
      });

    });

    describe("validation", () => {

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

      it("valid schema with options", () => {

        const value = 5;
        const schemaWithOptions = { type: "number", maximum: 10 } satisfies JSONSchema;

        storage.set(key, value, schemaWithOptions).pipe(mergeMap(() => storage.get(key, schemaWithOptions))).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          ;

        });
      });

      it("invalid schema with options", () => {

        const value = 15;
        const schemaWithOptions = { type: "number", maximum: 10 } satisfies JSONSchema;

        storage.set(key, value, { type: "number" }).pipe(mergeMap(() => storage.get(key, schemaWithOptions))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

          }
        });
      });

      it("invalid in get()", () => {

        storage.set(key, "test", { type: "string" }).pipe(mergeMap(() => storage.get<Test>(key, schema))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

          }
        });
      });

      it("invalid in set()", () => {

        storage.set(key, "test", schema).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);
            ;

          },
        });
      });

      it("invalid in watch()", () => {

        const watchedKey = "watched2";

        storage.set(watchedKey, "test", { type: "string" }).subscribe(() => {

          // // eslint-disable-next-line rxjs/no-nested-subscribe
          storage.watch(watchedKey, { type: "number" }).subscribe({
            error: () => {
              // Nothing to test
            }
          });

        });
      });

      it("null: no validation", () => {

        storage.get<string>(`noassociateddata${Date.now().toFixed()}`, schema).subscribe(() => {
          // Nothing to test
        });
      });

    });

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/25
     * Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/5 */
    describe("complete", () => {

      const schema = { type: "string" } satisfies JSONSchema;

      it("get()", () => {

        storage.get(key, schema).subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

      it("set()", () => {

        storage.set("index", "value", schema).subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

      it("delete()", () => {

        storage.delete(key).subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

      it("clear()", () => {

        storage.clear().subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

      it("size", () => {

        storage.size.subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

      it("keys()", () => {

        storage.keys().subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

      it("has()", () => {

        storage.has(key).subscribe({
          complete: () => {
            // Nothing to test
          }
        });
      });

    });

    describe("compatibility with @sinclair/typebox", () => {

      it("invalid", () => {

        storage.set(key, "test", Type.String()).pipe(mergeMap(() => storage.get(key, Type.Number()))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

          }
        });
      });

      it("invalid with options", () => {

        storage.set(key, "test", Type.String()).pipe(mergeMap(() => storage.get(key, Type.String({
          maxLength: 1,
        })))).subscribe({
          error: (error) => {

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(error.message).toBe(VALIDATION_ERROR);

          }
        });
      });

      it("string", () => {

        const value = "blue";
        const schema = Type.String();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          ;

        });
      });

      it("string (standalone import)", () => {

        const value = "blue";
        const schema = StringType();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          ;

        });
      });

      it("number", () => {

        const value = 1.5;
        const schema = Type.Number();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: number | undefined) => {

          expect(result).toBe(value);

          ;

        });
      });

      it("boolean", () => {

        const value = true;
        const schema = Type.Boolean();

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: boolean | undefined) => {

          expect(result).toBe(value);

          ;

        });
      });

      it("array", () => {

        const value = ["hello 1", "hello 2"];
        const schema = Type.Array(Type.String());

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string[] | undefined) => {

          expect(result).toEqual(value);

          ;

        });
      });

      it("tuple", () => {

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

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get<[
          string,
          Monster
        ]>(key, schema))).subscribe((result: [
          string,
          Monster
        ] | undefined) => {

          expect(result).toEqual(value);

          ;

        });
      });

      it("object", () => {

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

          ;

        });
      });

      it("with options", () => {

        const value = "blue";
        const schema = Type.String({
          maxLength: 10,
        });

        storage.set(key, value, schema).pipe(mergeMap(() => storage.get(key, schema))).subscribe((result: string | undefined) => {

          expect(result).toBe(value);

          ;

        });
      });

    });

    describe("compatibility with Promise", () => {

      const schema = { type: "string" } satisfies JSONSchema;

      it("Promise", () => {

        const value = "test";

        firstValueFrom(storage.set(key, value, schema))
          .then(() => firstValueFrom(storage.get(key, schema)))
          .then((result: string | undefined) => {
            expect(result).toBe(value);
            ;
          })
          .catch(() => {
            throw new Error();
          });
      });

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
    it("IndexedDb is used", (context) => new Promise(done => {

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

              closeAndDeleteDatabase(done, localStorageService);

            });

            request.addEventListener("error", () => {

              dbOpen.result.close();

              /* This case is not supposed to happen */
              throw new Error();

            });

          });

        }
        catch {
          context.skip();
        }

      });

    }));

    it("indexedDb with default options", () => new Promise(done => {

      TestBed.resetTestingModule();
      const localStorageService = new StorageMap(TestBed.inject(IndexedDBDatabase));

      /* Do a request first as a first transaction is needed to set the store name */
      localStorageService.get("test").subscribe(() => {

        const { database, store, version } = localStorageService.backingStore;

        expect(database).toBe(DEFAULT_IDB_DB_NAME);
        expect(store).toBe(DEFAULT_IDB_STORE_NAME);
        expect(version).toBe(DEFAULT_IDB_DB_VERSION);

        closeAndDeleteDatabase(done, localStorageService);

      });

    }));

    /* Avoid https://github.com/cyrilletuzi/angular-async-local-storage/issues/57 */
    it("indexedDb with noWrap to false", (context) => new Promise(done => {

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

              closeAndDeleteDatabase(done, localStorageService);

            });

            request.addEventListener("error", () => {

              dbOpen.result.close();

              /* This case is not supposed to happen */
              throw new Error();

            });

          });

        }
        catch {
          context.skip();
        }

      });

    }));

    it("indexedDb with custom options", () => new Promise(done => {

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

        closeAndDeleteDatabase(done, localStorageService);

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
