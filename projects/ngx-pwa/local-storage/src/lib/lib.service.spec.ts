import { TestBed } from '@angular/core/testing';
import { from } from 'rxjs';
import { map, first, take, mergeMap, filter } from 'rxjs/operators';

import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { LocalStorageDatabase } from './databases/localstorage-database';
import { MockLocalDatabase } from './databases/mock-local-database';
import { JSONSchema } from './validation/json-schema';
import { JSONValidator } from './validation/json-validator';

function testGetItem<T>(type: 'primitive' | 'object', localStorageService: LocalStorage, value: T, done: DoneFn) {

  localStorageService.setItem('test', value).subscribe(() => {

    localStorageService.getItem<T>('test').subscribe((data) => {

      if (type === 'primitive') {
        expect(data).toBe(value);
      } else {
        expect(data).toEqual(value);
      }

      done();

    });

  });

}

function testGetItemPrimitive<T>(localStorageService: LocalStorage, value: T, done: DoneFn) {

  testGetItem<T>('primitive', localStorageService, value, done);

}

function testGetItemObject<T>(localStorageService: LocalStorage, value: T, done: DoneFn) {

  testGetItem<T>('object', localStorageService, value, done);

}

function tests(localStorageService: LocalStorage) {

  it('should return null on unknown index', (done: DoneFn) => {

    localStorageService.getItem('unknown').subscribe((data) => {

      expect(data).toBeNull();

      done();

    });

  });

  it('should store and return a string', (done: DoneFn) => {

    testGetItemPrimitive<string>(localStorageService, 'blue', done);

  });

  it('should store and return an empty string', (done: DoneFn) => {

    testGetItemPrimitive<string>(localStorageService, '', done);

  });

  it('should store and return a number', (done: DoneFn) => {

    testGetItemPrimitive<number>(localStorageService, 10, done);

  });

  it('should store and return zero', (done: DoneFn) => {

    testGetItemPrimitive<number>(localStorageService, 0, done);

  });

  it('should store and return true', (done: DoneFn) => {

    testGetItemPrimitive<boolean>(localStorageService, true, done);

  });

  it('should store and return false', (done: DoneFn) => {

    testGetItemPrimitive<boolean>(localStorageService, false, done);

  });

  it('should store and return null', (done: DoneFn) => {

    testGetItemPrimitive<null>(localStorageService, null, done);

  });

  it('should store and return null for undefined too', (done: DoneFn) => {

    localStorageService.setItem('test', undefined).subscribe(() => {

      localStorageService.getItem('test').subscribe((data) => {

        expect(data).toBe(null);

        done();

      });

    });

  });

  it('should store and return an array', (done: DoneFn) => {

    testGetItemObject<number[]>(localStorageService, [1, 2, 3], done);

  });

  it('should store and return an object', (done: DoneFn) => {

    testGetItemObject<{name: string}>(localStorageService, { name: 'test' }, done);

  });

  it('should return null on deleted index', (done: DoneFn) => {

    const index = 'test';

    localStorageService.setItem(index, 'test').subscribe(() => {

      localStorageService.removeItem(index).subscribe(() => {

        localStorageService.getItem<string>(index).subscribe((data) => {

          expect(data).toBeNull();

          done();

        });

      });

    });

  });

  it('should count the size of items stored', (done: DoneFn) => {

    localStorageService.size.subscribe((length0) => {

      expect(length0).toBe(0);

      localStorageService.setItem('test1', 'test').subscribe(() => {

        localStorageService.size.subscribe((length1) => {

          expect(length1).toBe(1);

          localStorageService.setItem('test2', 'test').subscribe(() => {

            localStorageService.size.subscribe((length2) => {

              expect(length2).toBe(2);

              localStorageService.clear().subscribe(() => {

                localStorageService.size.subscribe((length3) => {

                  expect(length3).toBe(0);

                  done();

                });

              });

            });

          });

        });

      });

    });

  });

  it('should get keys', (done: DoneFn) => {

    const index1 = 'index1';
    const index2 = 'index2';

    localStorageService.setItem(index1, 'test').subscribe(() => {

      localStorageService.setItem(index2, 'test').subscribe(() => {

        localStorageService.keys().subscribe((keys) => {

          /* Sorting because Firefox keys order is inconsistent */
          expect([index1, index2].sort()).toEqual(keys.sort());

          done();

        });

      });

    });

  });

  it('should get an empty arrays if no keys', (done: DoneFn) => {

    localStorageService.keys().subscribe((keys) => {

      expect(keys.length).toBe(0);

      done();

    });

  });

  it('should returns true if a key exists', (done: DoneFn) => {

    const index = 'hello';

    localStorageService.setItem(index, 'test').subscribe(() => {

      localStorageService.has(index).subscribe((result) => {

        expect(result).toBe(true);

        done();

      });

    });

  });

  it('should returns false if a key does not exist', (done: DoneFn) => {

    localStorageService.has('sdcccscsd').subscribe((result) => {

      expect(result).toBe(false);

      done();

    });

  });

  it('should be able to remove only some items', (done: DoneFn) => {

    const index1 = 'user_firstname';
    const index2 = 'user_lastname';
    const index3 = 'app_data1';
    const index4 = 'app_data2';

    localStorageService.setItem(index1, 'test').subscribe(() => {

      localStorageService.setItem(index2, 'test').subscribe(() => {

        localStorageService.setItem(index3, 'test').subscribe(() => {

          localStorageService.setItem(index4, 'test').subscribe(() => {

            localStorageService.keys().pipe(
              mergeMap((keys) => from(keys)),
              filter((key) => key.startsWith('app_')),
              mergeMap((key) => localStorageService.removeItem(key))
            ).subscribe({ complete: () => {

              localStorageService.size.subscribe((size) => {

                expect(size).toBe(2);

                done();

              });

            } });

          });

        });

      });

    });

  });

  it('should allow to use operators', (done: DoneFn) => {

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<string>(index).pipe(map((data) => data)).subscribe((data) => {

        expect(data).toBe(value);

        done();

      });

    });

  });

  it('should call error callback if data is invalid against JSON schema', (done: DoneFn) => {

    const index = 'index';
    const value = {
      unexpected: 'value'
    };
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<{ expected: string }>(index, { schema }).subscribe(() => {

        fail();

        done();

      }, (error) => {

        expect(error.message).toBe(`JSON invalid`);

        done();

      });

    });

  });

  it('should return the data if JSON schema is valid', (done: DoneFn) => {

    const index = 'index';
    const value = {
      expected: 'value'
    };
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<{ expected: string }>(index, { schema }).subscribe((data) => {

        expect(data).toEqual(value);

        done();

      }, () => {

        fail();

        done();

      });

    });

  });

  it('should return the data if the data is null (no validation)', (done: DoneFn) => {

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    localStorageService.getItem<{ expected: string }>('notexisting', { schema }).subscribe((data) => {

      expect((data)).toBeNull();

      done();

    }, () => {

      fail();

      done();

    });

  });

  it('should call complete on setItem', (done: DoneFn) => {

    localStorageService.setItem('index', 'value').subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should call complete on existing getItem', (done: DoneFn) => {

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<string>(index).subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

  });

  it('should call complete on unexisting getItem', (done: DoneFn) => {

    localStorageService.getItem<string>('notexisting').subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should call complete on existing removeItem', (done: DoneFn) => {

    const index = 'index';

    localStorageService.setItem(index, 'value').subscribe(() => {

      localStorageService.removeItem(index).subscribe({ complete: () => {

        expect().nothing();

        done(); } });

    });

  });

  it('should call complete on unexisting removeItem', (done: DoneFn) => {

    localStorageService.removeItem('notexisting').subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should call complete on clear', (done: DoneFn) => {

    localStorageService.clear().subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should call complete on length', (done: DoneFn) => {

    localStorageService.size.subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should call complete when getting existing keys', (done: DoneFn) => {

    localStorageService.setItem('index1', 'value').subscribe(() => {

      localStorageService.setItem('index2', 'value').subscribe(() => {

        localStorageService.keys().subscribe({ complete: () => {

          expect().nothing();

          done();

        } });

      });

    });

  });

  it('should call complete when getting no keys', (done: DoneFn) => {

    localStorageService.keys().subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should call complete when checking existing key', (done: DoneFn) => {

    const index = 'world';

    localStorageService.setItem(index, 'test').subscribe(() => {

      localStorageService.has(index).subscribe({ complete: () => {

        expect().nothing();

        done();

      } });

    });

  });

  it('should call complete when checking unexisting key', (done: DoneFn) => {

    localStorageService.has('sdscsdlkscocoucsnoc').subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should be OK if user manually used first() to complete', (done: DoneFn) => {

    localStorageService.clear().pipe(first()).subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should be OK if user manually used take(1) to complete', (done: DoneFn) => {

    localStorageService.clear().pipe(take(1)).subscribe({ complete: () => {

      expect().nothing();

      done();

    } });

  });

  it('should be able to update an existing index', (done: DoneFn) => {

    const index = 'index';

    localStorageService.setItem(index, 'value').subscribe(() => {

      localStorageService.setItem(index, 'updated').subscribe(() => {

        expect().nothing();

        done();

      }, () => {
        fail();
      });

    });

  });

  it('should work in a Promise-way', (done: DoneFn) => {

    const index = 'index';
    const value = 'test';

    localStorageService.setItem(index, value).toPromise()
    .then(() => localStorageService.getItem(index).toPromise())
    .then((result) => {
      expect(result).toBe(value);
      done();
    }, () => {
      fail();
    });

  });

  it('should work with async / await', async () => {

    const index = 'index';
    const value = 'test';

    await localStorageService.setItem(index, value).toPromise();

    const result = await localStorageService.getItem(index).toPromise();

    expect(result).toBe(value);

  });

  it('should set item and auto-subscribe', (done: DoneFn) => {

    const index = 'index';
    const value = 'test';

    localStorageService.setItemSubscribe(index, value);

    window.setTimeout(() => {

      localStorageService.getItem<string>(index).subscribe((data) => {
        expect(data).toBe(value);
        done();
      }, () => {
        fail();
      });

    }, 50);

  });

  it('should remove item and auto-subscribe', (done: DoneFn) => {

    const index = 'index';
    const value = 'test';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.removeItemSubscribe(index);

      window.setTimeout(() => {

        localStorageService.getItem<string>(index).subscribe((data) => {
          expect(data).toBe(null);
          done();
        }, () => {
          fail();
        });

      }, 50);

    });

  });

  it('should clear storage and auto-subscribe', (done: DoneFn) => {

    const index = 'index';
    const value = 'test';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.clearSubscribe();

      window.setTimeout(() => {

        localStorageService.getItem<string>(index).subscribe((data) => {
          expect(data).toBe(null);
          done();
        }, () => {
          fail();
        });

      }, 50);

    });

  });

  it('should not cause concurrency issue when not waiting setItem to be done', (done: DoneFn) => {

    const index = 'index';
    const value1 = 'test1';
    const value2 = 'test2';

    expect(() => {

      localStorageService.setItem(index, value1).subscribe();

      localStorageService.setItem(index, value2).subscribe(() => {

        localStorageService.getItem(index).subscribe((result) => {

          expect(result).toBe(value2);

          done();

        });

      });

    }).not.toThrow();

  });

}

describe('LocalStorage with mock storage', () => {

  const localStorageService = new LocalStorage(new MockLocalDatabase(), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      done();
    });
  });

  tests(localStorageService);

});

describe('LocalStorage with localStorage', () => {

  const localStorageService = new LocalStorage(new LocalStorageDatabase(), new JSONValidator());

  beforeEach(() => {
    localStorage.clear();
  });

  tests(localStorageService);

});

describe('LocalStorage with IndexedDB', () => {

  const localStorageService = new LocalStorage(new IndexedDBDatabase(), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      done();
    });
  });

  tests(localStorageService);

  it('should use IndexedDb (will be pending in Firefox/IE private mode)', (done: DoneFn) => {

    const index = `test${Date.now()}`;
    const value = 'test';

    localStorageService.setItem(index, value).subscribe(() => {

      try {

        const dbOpen = indexedDB.open('ngStorage');

        dbOpen.addEventListener('success', (openEvent) => {

          const database = (openEvent.target as IDBRequest).result as IDBDatabase;

          const localStorageObject = database.transaction(['localStorage'], 'readonly').objectStore('localStorage');

          localStorageObject.get(index).addEventListener('success', (requestEvent) => {

            expect((requestEvent.target as IDBRequest).result).toEqual({ value });

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

  function testSetCompatibilityWithNativeAPI(done: DoneFn, value: any) {

    const index = 'test';

    try {

      const dbOpen = indexedDB.open('ngStorage');

      dbOpen.addEventListener('success', (openEvent) => {

        const database = (openEvent.target as IDBRequest).result as IDBDatabase;

        const localStorageObject = database.transaction(['localStorage'], 'readwrite').objectStore('localStorage');

        try {

          localStorageObject.add(value, index).addEventListener('success', () => {

            localStorageService.setItem(index, 'world').subscribe(() => {

              expect().nothing();

              done();

            }, () => {

              /* Cases : Edge/IE because of `undefined` */
              pending();

            });

          });

        } catch {

          /* Cases : Edge/IE because of `null` */
          pending();

        }

      });

      dbOpen.addEventListener('error', () => {

        /* Cases : Firefox private mode where `indexedDb` exists but fails */
        pending();

      });

    } catch {

        /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
        pending();

    }

  }

  const setTestValues = ['hello', '', 0, false, null, undefined];

  for (const setTestValue of setTestValues) {

    it(`should store a value on an index previously used by another API
      (will be pending in IE/Firefox private mode and 2 pending in Edge/IE because of null and undefined)`, (done: DoneFn) => {

      testSetCompatibilityWithNativeAPI(done, setTestValue);

    });

  }

  function testGetCompatibilityWithNativeAPI(done: DoneFn, value: any, schema: JSONSchema) {

    const index = 'test';

    try {

      const dbOpen = indexedDB.open('ngStorage');

      dbOpen.addEventListener('success', (openEvent) => {

        const database = (openEvent.target as IDBRequest).result as IDBDatabase;

        const localStorageObject = database.transaction(['localStorage'], 'readwrite').objectStore('localStorage');

        try {

          localStorageObject.add(value, index).addEventListener('success', () => {

            localStorageService.getItem(index, { schema }).subscribe((result) => {

              expect(result).toEqual((value !== undefined) ? value : null);

              done();

            });

          });

        } catch {

          /* Cases : Edge/IE because of `null` */
          pending();

        }

      });

      dbOpen.addEventListener('error', () => {

        /* Cases : Firefox private mode where `indexedDb` exists but fails */
        pending();

      });

    } catch (error) {

        /* Cases : IE private mode where `indexedDb` will exist but not its `open()` method */
        pending();

    }

  }

  const getTestValues: [any, JSONSchema][] = [
    ['hello', { type: 'string' }],
    ['', { type: 'string' }],
    [0, { type: 'number' }],
    [1, { type: 'number' }],
    [true, { type: 'boolean' }],
    [false, { type: 'boolean' }],
    // TODO: delete cast when TS 3.2 issue is fixed
    [[1, 2, 3], { type: 'array', items: { type: 'number' } }],
    [{ test: 'value' }, { type: 'object', properties: { test: { type: 'string' } } }],
    [null, { type: 'null' }],
    [undefined, { type: 'null' }],
  ];

  for (const [getTestValue, getTestSchema] of getTestValues) {

    it(`should get a value on an index previously used by another lib API
      (will be pending in IE/Firefox private mode and 1 pending in Edge/IE because of null)`, (done: DoneFn) => {

      testGetCompatibilityWithNativeAPI(done, getTestValue, getTestSchema);

    });

  }

});

describe('LocalStorage with localStorage and a prefix', () => {

  it('should have the wanted prefix', () => {

    const prefix = 'myapp';

    class LocalStorageDatabasePrefix extends LocalStorageDatabase {
      getPrefix() {
        return this.prefix;
      }
    }

    const localStorageServicePrefix = new LocalStorageDatabasePrefix(prefix);

    expect(localStorageServicePrefix.getPrefix()).toBe(`${prefix}_`);

  });

  const localStorageService = new LocalStorage(new LocalStorageDatabase('myapp'), new JSONValidator());

  beforeEach(() => {
    localStorage.clear();
  });

  tests(localStorageService);

});

describe('LocalStorage with IndexedDB and a prefix', () => {

  it('should have the wanted prefix', () => {

    const prefix = 'myapp';
    const dbName = 'ngStorage';

    class IndexedDBDatabasePrefix extends IndexedDBDatabase {
      getDbBame() {
        return this.dbName;
      }
    }

    const indexedDBService = new IndexedDBDatabasePrefix(prefix);

    expect(indexedDBService.getDbBame()).toBe(`${prefix}_${dbName}`);

  });

  const localStorageService = new LocalStorage(new IndexedDBDatabase('myapp'), new JSONValidator());

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      done();
    });
  });

  tests(localStorageService);

});

describe('LocalStorage with automatic storage injection', () => {

  it('should store and get the same value', (done: DoneFn) => {

    // TODO: investigate why the test is failing in Firefox private mode

    const localStorageService = TestBed.get(LocalStorage) as LocalStorage;

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<string>(index).subscribe((data) => {
        expect(data).toBe(value);
        done();
      });

    });

  });

});
