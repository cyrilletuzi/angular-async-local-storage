import { TestBed } from "@angular/core/testing";
import { IndexedDBDatabase } from "../databases/indexeddb-database";
import { provideIndexedDBDataBaseName } from "../providers";
import { StorageMap } from "../storages/storage-map.service";
import { DEFAULT_IDB_STORE_NAME } from "../tokens";
import type { JSONSchema } from "../validation/json-schema";
import { clearStorage, closeAndDeleteDatabase } from "./cleaning.spec";


const dbName = `interopStore${Date.now()}`;
const index = "test";

/**
 * Set a value with native `indexedDB` API and try to override it with the lib
 * @param localStorageService Service
 * @param done Jasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param value Value to store
 */
function testSetCompatibilityWithNativeAPI(localStorageService: StorageMap, done: DoneFn, value: unknown): void {

  try {

    const dbOpen = indexedDB.open(dbName);

    dbOpen.addEventListener("upgradeneeded", () => {

      if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

        /* Create the object store */
        dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME);

      }

    });

    dbOpen.addEventListener("success", () => {

      const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], "readwrite").objectStore(DEFAULT_IDB_STORE_NAME);

      try {

        const request = store.add(value, index);

        request.addEventListener("success", () => {

          localStorageService.set(index, "world").subscribe({
            next: () => {

              expect().nothing();

              dbOpen.result.close();

              done();

            },
            error: () => {

              dbOpen.result.close();

              pending();

            },

          });

        });

        request.addEventListener("error", () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

        });

      } catch {

        dbOpen.result.close();

        pending();

      }

    });

  } catch {

    pending();

  }

}

/**
 * Set a value with native `indexedDB` API and try to get it with the lib
 * @param localStorageService Service
 * @param done Jasmine helper to explicit when the operation has ended to avoid tests overlap
 * @param value Value to set and get
 */
function testGetCompatibilityWithNativeAPI(localStorageService: StorageMap, done: DoneFn, value: unknown, schema?: JSONSchema): void {

  try {

    const dbOpen = indexedDB.open(dbName);

    dbOpen.addEventListener("upgradeneeded", () => {

      if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

        /* Create the object store */
        dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME);

      }

    });

    dbOpen.addEventListener("success", () => {

      const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], "readwrite").objectStore(DEFAULT_IDB_STORE_NAME);

      try {

        const request = store.add(value, index);

        request.addEventListener("success", () => {

          const request2 = schema ? localStorageService.get<unknown>(index, schema) : localStorageService.get(index);

          request2.subscribe((result) => {

            /* Transform `null` to `undefined` to align with the lib behavior */
            expect(result).toEqual((value !== null) ? (value) : undefined);

            dbOpen.result.close();

            done();

          });

        });

        request.addEventListener("error", () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

        });

      } catch {

        dbOpen.result.close();

        pending();

      }

    });

  } catch {

    pending();

  }

}

describe("Interoperability", () => {

  let localStorageService: StorageMap;

  beforeAll(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideIndexedDBDataBaseName(dbName),
      ],
    });
    localStorageService = new StorageMap(TestBed.inject(IndexedDBDatabase));
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

  const setTestValues = ["hello", "", 0, false, null, undefined];

  for (const setTestValue of setTestValues) {

    it(`setItem() after external API`, (done) => {

      testSetCompatibilityWithNativeAPI(localStorageService, done, setTestValue);

    });

  }

  const getTestValues: [unknown, JSONSchema | undefined][] = [
    ["hello", { type: "string" }],
    ["", { type: "string" }],
    [0, { type: "number" }],
    [1, { type: "number" }],
    [true, { type: "boolean" }],
    [false, { type: "boolean" }],
    [[1, 2, 3], { type: "array", items: { type: "number" } }],
    [{ test: "value" }, { type: "object", properties: { test: { type: "string" } } }],
    [null, undefined],
    [undefined, undefined],
  ];

  for (const [getTestValue, getTestSchema] of getTestValues) {

    it(`getItem() after external API`, (done) => {

      testGetCompatibilityWithNativeAPI(localStorageService, done, getTestValue, getTestSchema);

    });

  }

  it("keys() should return strings only", (done) => {

    const key = 1;

    try {

      const dbOpen = indexedDB.open(dbName);

      dbOpen.addEventListener("upgradeneeded", () => {

        if (!dbOpen.result.objectStoreNames.contains(DEFAULT_IDB_STORE_NAME)) {

          /* Create the object store */
          dbOpen.result.createObjectStore(DEFAULT_IDB_STORE_NAME);

        }

      });

      dbOpen.addEventListener("success", () => {

        const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], "readwrite").objectStore(DEFAULT_IDB_STORE_NAME);

        const request = store.add("test", key);

        request.addEventListener("success", () => {

          localStorageService.keys().subscribe({
            next: (keyItem) => {
              expect(typeof keyItem).toBe("string");
            },
            complete: () => {
              dbOpen.result.close();
              done();
            }
          });

        });

        request.addEventListener("error", () => {

          dbOpen.result.close();

          /* This case is not supposed to happen */
          fail();

        });

      });

    } catch (error) {

      pending();

    }

  });

});
