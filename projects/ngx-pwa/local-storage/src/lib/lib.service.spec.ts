import { TestBed } from '@angular/core/testing';
import { from } from 'rxjs';
import { mergeMap, filter, tap } from 'rxjs/operators';

import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { LocalStorageDatabase } from './databases/localstorage-database';
import { MemoryDatabase } from './databases/memory-database';
import { JSONSchema } from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';
import { VALIDATION_ERROR } from './exceptions';
import { DEFAULT_IDB_DB_NAME, DEFAULT_IDB_STORE_NAME } from './tokens';
import { clearIndexedDB } from './testing/indexeddb';

function tests(localStorageService: LocalStorage) {

  const key = 'test';

  describe(('setItem() + getItem()'), () => {

    it('unexisting key', (done: DoneFn) => {

      localStorageService.getItem(`unknown${Date.now()}`).subscribe((data) => {

        expect(data).toBeNull();

        done();

      });

    });

    it('string', (done: DoneFn) => {

      const value = 'blue';

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('empty string', (done: DoneFn) => {

      const value = '';

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('integer', (done: DoneFn) => {

      const value = 1;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('number', (done: DoneFn) => {

      const value = 1.5;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('zero', (done: DoneFn) => {

      const value = 0;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('true', (done: DoneFn) => {

      const value = true;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('false', (done: DoneFn) => {

      const value = false;

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBe(value);

        done();

      });

    });

    it('null', (done: DoneFn) => {

      const value = null;

      localStorageService.setItem(key, value as any).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBeNull();

        done();

      });

    });

    it('undefined', (done: DoneFn) => {

      const value = undefined;

      localStorageService.setItem(key, value as any).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBeNull();

        done();

      });

    });

    it('array', (done: DoneFn) => {

      const value = [1, 2, 3];

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toEqual(value);

        done();

      });

    });

    it('object', (done: DoneFn) => {

      const value = { name: 'test' };

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toEqual(value);

        done();

      });

    });

    it('update', (done: DoneFn) => {

      localStorageService.setItem(key, 'value').pipe(
        mergeMap(() => localStorageService.setItem(key, 'updated'))
      ).subscribe(() => {

          expect().nothing();

          done();

        });

    });

    it('concurrency', (done: DoneFn) => {

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

    it('existing key', (done: DoneFn) => {

      localStorageService.setItem(key, 'test').pipe(
        mergeMap(() => localStorageService.removeItem(key)),
        mergeMap(() => localStorageService.getItem(key))
      ).subscribe((result) => {

        expect(result).toBeNull();

        done();

      });

    });

    it('unexisting key', (done: DoneFn) => {

      localStorageService.removeItem(`unexisting${Date.now()}`).subscribe(() => {

          expect().nothing();

          done();

      });

    });

  });

  describe('Map-like API', () => {

    it('size', (done: DoneFn) => {

      localStorageService.size.pipe(
        tap((length) => { expect(length).toBe(0) }),
        mergeMap(() => localStorageService.setItem(key, 'test')),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(1) }),
        mergeMap(() => localStorageService.setItem('', 'test')),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(2) }),
        mergeMap(() => localStorageService.removeItem(key)),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(1) }),
        mergeMap(() => localStorageService.clear()),
        mergeMap(() => localStorageService.size),
        tap((length) => { expect(length).toBe(0) }),
      ).subscribe(() => {
        done();
      })

    });

    it('keys()', (done: DoneFn) => {

      const key1 = 'index1';
      const key2 = 'index2';

      localStorageService.setItem(key1, 'test').pipe(
        mergeMap(() => localStorageService.setItem(key2, 'test')),
        mergeMap(() => localStorageService.keys()),
      ).subscribe((keys) => {

        // TODO: Investigate further
        /* Sorting because Firefox keys order is inconsistent with `localStorage` and a prefix */
        expect([key1, key2].sort()).toEqual(keys.sort());

        done();

      });

    });

    it('getKey() when no items', (done: DoneFn) => {

      localStorageService.keys().subscribe((keys) => {

        expect(keys.length).toBe(0);

        done();

      });

    });

    it('key() on existing', (done: DoneFn) => {

      localStorageService.setItem(key, 'test').pipe(
        mergeMap(() => localStorageService.has(key))
      ).subscribe((result) => {

        expect(result).toBe(true);

        done();

      });

    });

    it('key() on unexisting', (done: DoneFn) => {

      localStorageService.has(`nokey${Date.now()}`).subscribe((result) => {

        expect(result).toBe(false);

        done();

      });

    });

    it('advanced case: remove only some items', (done: DoneFn) => {

      localStorageService.setItem('user_firstname', 'test').pipe(
        mergeMap(() => localStorageService.setItem('user_lastname', 'test')),
        mergeMap(() => localStorageService.setItem('app_data1', 'test')),
        mergeMap(() => localStorageService.setItem('app_data2', 'test')),
        mergeMap(() => localStorageService.keys()),
        /* Now we will have an `Observable` emiting multiple values */
        mergeMap((keys) => from(keys)),
        filter((key) => key.startsWith('app_')),
        mergeMap((key) => localStorageService.removeItem(key)),
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

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    it('valid', (done: DoneFn) => {

      const value = { expected: 'value' };

      localStorageService.setItem(key, value).pipe(
        mergeMap(() => localStorageService.getItem(key, { schema }))
      ).subscribe((data) => {

        expect(data).toEqual(value);

        done();

      });

    });

    it('invalid', (done: DoneFn) => {

      localStorageService.setItem(key, 'test').pipe(
        mergeMap(() => localStorageService.getItem(key, { schema }))
      ).subscribe({ error: (error) => {

        expect(error.message).toBe(VALIDATION_ERROR);

          done();

      } });

    });

    it('null: no validation', (done: DoneFn) => {

      localStorageService.getItem<{ expected: string }>(`noassociateddata${Date.now()}`, { schema }).subscribe(() => {

        expect().nothing();

        done();

      });

    });

  });

  describe('complete', () => {

    it('setItem()', (done: DoneFn) => {

      localStorageService.setItem('index', 'value').subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('getItem()', (done: DoneFn) => {

      localStorageService.getItem(key).subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('removeItem()', (done: DoneFn) => {

      localStorageService.removeItem(key).subscribe({ complete: () => {

        expect().nothing();

        done(); }

      });

    });

    it('clear()', (done: DoneFn) => {

      localStorageService.clear().subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('size', (done: DoneFn) => {

      localStorageService.size.subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('keys()', (done: DoneFn) => {

      localStorageService.keys().subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

    it('has()', (done: DoneFn) => {

      localStorageService.has(key).subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

  });

  describe('compatibility', () => {

    it('Promise', (done: DoneFn) => {

      const value = 'test';

      localStorageService.setItem(key, value).toPromise()
        .then(() => localStorageService.getItem(key).toPromise())
        .then((result) => {
          expect(result).toBe(value);
          done();
        });

    });

    it('async / await', async () => {

      const value = 'test';

      await localStorageService.setItem(key, value).toPromise();

      const result = await localStorageService.getItem(key).toPromise();

      expect(result).toBe(value);

    });

  });

  describe('auto-subscribe', () => {

    it('setItemSubscribe()', (done: DoneFn) => {

      const value = 'test';

      localStorageService.setItemSubscribe(key, value);

      window.setTimeout(() => {

        localStorageService.getItem(key).subscribe((data) => {
          expect(data).toBe(value);
          done();
        });

      }, 50);

    });

    it('removeItemSubscribe()', (done: DoneFn) => {

      const value = 'test';

      localStorageService.setItem(key, value).subscribe(() => {

        localStorageService.removeItemSubscribe(key);

        window.setTimeout(() => {

          localStorageService.getItem(key).subscribe((data) => {
            expect(data).toBeNull();
            done();
          });

        }, 50);

      });

    });

    it('clearSubscribe()', (done: DoneFn) => {

      const value = 'test';

      localStorageService.setItem(key, value).subscribe(() => {

        localStorageService.clearSubscribe();

        window.setTimeout(() => {

          localStorageService.getItem(key).subscribe((data) => {
            expect(data).toBe(null);
            done();
          });

        }, 50);

      });

    });

  });

}

describe('Memory', () => {

  const localStorageService = new LocalStorage(new MemoryDatabase(), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      done();
    });
  });

  tests(localStorageService);

});

describe('localStorage', () => {

  const localStorageService = new LocalStorage(new LocalStorageDatabase(), new JSONValidator());

  beforeEach(() => {
    localStorage.clear();
  });

  tests(localStorageService);

});

describe('IndexedDB', () => {

  const localStorageService = new LocalStorage(new IndexedDBDatabase(), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      clearIndexedDB(done);
    });
  });

  tests(localStorageService);

  it('check use of IndexedDb (will be pending in Firefox/IE private mode)', (done: DoneFn) => {

    const index = `test${Date.now()}`;
    const value = 'test';

    localStorageService.setItem(index, value).subscribe(() => {

      try {

        const dbOpen = indexedDB.open(DEFAULT_IDB_DB_NAME);

        dbOpen.addEventListener('success', () => {

          const store = dbOpen.result.transaction([DEFAULT_IDB_STORE_NAME], 'readonly').objectStore(DEFAULT_IDB_STORE_NAME);

          const request = store.get(index);

          request.addEventListener('success', () => {

            expect(request.result).toEqual({ value });

            done();

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

});

describe('localStorage and a prefix', () => {

  const prefix = 'myapp';

  it('check prefix', () => {

    class LocalStorageDatabasePrefix extends LocalStorageDatabase {
      getPrefix() {
        return this.prefix;
      }
    }

    const localStorageServicePrefix = new LocalStorageDatabasePrefix(prefix);

    expect(localStorageServicePrefix.getPrefix()).toBe(`${prefix}_`);

  });

  const localStorageService = new LocalStorage(new LocalStorageDatabase(prefix), new JSONValidator());

  beforeEach(() => {
    localStorage.clear();
  });

  tests(localStorageService);

});

describe('IndexedDB and a prefix', () => {

  const prefix = 'myapp';

  it('check prefix', () => {

    const dbName = 'ngStorage';

    class IndexedDBDatabasePrefix extends IndexedDBDatabase {
      getDbBame() {
        return this.dbName;
      }
    }

    const indexedDBService = new IndexedDBDatabasePrefix(prefix);

    expect(indexedDBService.getDbBame()).toBe(`${prefix}_${dbName}`);

  });

  it('check prefix with custom database and store names', () => {

    const dbName = 'customDb';

    class IndexedDBDatabasePrefix extends IndexedDBDatabase {

      getDbBame() {
        return this.dbName;
      }

    }

    const indexedDBService = new IndexedDBDatabasePrefix(prefix, dbName);

    expect(indexedDBService.getDbBame()).toBe(`${prefix}_${dbName}`);

  });

  const localStorageService = new LocalStorage(new IndexedDBDatabase(prefix), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      clearIndexedDB(done);
    });
  });

  tests(localStorageService);

});

describe('IndexedDB with custom database and store names', () => {

  const dbName = 'dBcustom';
  const storeName = 'storeCustom';

  const localStorageService = new LocalStorage(new IndexedDBDatabase(null, dbName, storeName), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      clearIndexedDB(done);
    });
  });

  tests(localStorageService);

});

describe('Automatic storage injection', () => {

  it('valid', (done: DoneFn) => {

    const localStorageService = TestBed.get(LocalStorage) as LocalStorage;

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).pipe(
      mergeMap(() => localStorageService.getItem(index))
    ).subscribe((data) => {
      expect(data).toBe(value);
      done();
    });

  });

});
