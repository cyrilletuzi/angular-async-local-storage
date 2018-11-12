import { inject, async } from '@angular/core/testing';
import { map, first, take } from 'rxjs/operators';

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

  /*
  localStorageService.getItem('test').subscribe((result) => {});
  localStorageService.getItem<string>('test').subscribe((result) => {});
  localStorageService.getItem<string>('test', {}).subscribe((result) => {});
  localStorageService.getItem<string>('test', { schema: { type: 'string' }}).subscribe((result) => {});
  localStorageService.getItem('test', { schema: { type: 'string' }}).subscribe((result) => {});

  localStorageService.getUnsafeItem('test').subscribe((result) => {});
  localStorageService.getUnsafeItem<string>('test').subscribe((result) => {});
  */

}

function testGetItemPrimitive<T>(localStorageService: LocalStorage, value: T, done: DoneFn) {

  testGetItem<T>('primitive', localStorageService, value, done);

}

function testGetItemObject<T>(localStorageService: LocalStorage, value: T, done: DoneFn) {

  testGetItem<T>('object', localStorageService, value, done);

}

function tests(localStorageService: LocalStorage) {

  beforeEach((done: DoneFn) => {
    localStorageService.clear().subscribe(() => {
      done();
    });
  });

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

    localStorageService.length.subscribe((length0) => {

      expect(length0).toBe(0);

      localStorageService.setItem('test1', 'test').subscribe(() => {

        localStorageService.length.subscribe((length1) => {

          expect(length1).toBe(1);

          localStorageService.setItem('test2', 'test').subscribe(() => {

            localStorageService.length.subscribe((length2) => {

              expect(length2).toBe(2);

              localStorageService.clear().subscribe(() => {

                localStorageService.length.subscribe((length3) => {

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

  it('should get index from keys', (done: DoneFn) => {

    const index1 = 'index1';
    const index2 = 'index2';

    localStorageService.key(1).subscribe((noIndex) => {

      expect(noIndex).toBe(null);

      localStorageService.setItem(index1, 'test').subscribe(() => {

        localStorageService.key(0).subscribe((indexResult1) => {

          /* Test with toContain(), as there can be a prefix */
          expect(indexResult1).toContain(index1);

          localStorageService.setItem(index2, 'test').subscribe(() => {

            localStorageService.key(1).subscribe((indexResult2) => {

              expect(indexResult2).toContain(index2);

              localStorageService.removeItem(index1).subscribe(() => {

                localStorageService.key(0).subscribe((indexResult3) => {

                  expect(indexResult3).toContain(index2);

                  done();

                });

              });

            });

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

    localStorageService.setItem('index', 'value').subscribe({ complete: () => { done(); } });

  });

  it('should call complete on existing getItem', (done: DoneFn) => {

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<string>(index).subscribe({ complete: () => { done(); } });

    });

  });

  it('should call complete on unexisting getItem', (done: DoneFn) => {

    localStorageService.getItem<string>('notexisting').subscribe({ complete: () => { done(); } });

  });

  it('should call complete on existing removeItem', (done: DoneFn) => {

    const index = 'index';

    localStorageService.setItem(index, 'value').subscribe(() => {

      localStorageService.removeItem(index).subscribe({ complete: () => { done(); } });

    });

  });

  it('should call complete on unexisting removeItem', (done: DoneFn) => {

    localStorageService.removeItem('notexisting').subscribe({ complete: () => { done(); } });

  });

  it('should call complete on clear', (done: DoneFn) => {

    localStorageService.clear().subscribe({ complete: () => { done(); } });

  });

  it('should call complete on length', (done: DoneFn) => {

    localStorageService.length.subscribe({ complete: () => { done(); } });

  });

  it('should call complete on existing key', (done: DoneFn) => {

    localStorageService.setItem('index', 'value').subscribe(() => {

      localStorageService.key(0).subscribe({ complete: () => { done(); } });

    });

  });

  it('should call complete on unexisting key', (done: DoneFn) => {

    localStorageService.key(5).subscribe({ complete: () => { done(); } });

  });

  it('should be OK if user manually used first() to complete', (done: DoneFn) => {

    localStorageService.clear().pipe(first()).subscribe({ complete: () => { done(); } });

  });

  it('should be OK if user manually used take(1) to complete', (done: DoneFn) => {

    localStorageService.clear().pipe(take(1)).subscribe({ complete: () => { done(); } });

  });

  it('should be able to update an existing index', (done: DoneFn) => {

    const index = 'index';

    localStorageService.setItem(index, 'value').subscribe(() => {

      localStorageService.setItem(index, 'updated').subscribe(() => {
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

  tests(localStorageService);

});

describe('LocalStorage with localStorage', () => {

  const localStorageService = new LocalStorage(new LocalStorageDatabase(), new JSONValidator());

  tests(localStorageService);

});

describe('LocalStorage with IndexedDB', () => {

  const localStorageService = new LocalStorage(new IndexedDBDatabase(), new JSONValidator());

  tests(localStorageService);

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

  tests(localStorageService);

});

describe('LocalStorage with automatic storage injection', () => {

  it('should store and get the same value', async(inject([LocalStorage], (localStorageService: LocalStorage) => {

    const index = 'index';
    const value = 'value';

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem<string>(index).subscribe((data) => {
        expect(data).toBe(value);
      });

    });

  })));

});
