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

      localStorageService.getItem<{ expected: string }>(index, { schema }).subscribe((data) => {

        fail();

        done();

      }, (error) => {

        expect(error.message).toBe(`JSON invalid`);

        done();

      });

    });

  });

  it('should call error callback if the JSON schema itself is invalid', (done: DoneFn) => {

    const index = 'doesnotmatter';
    const value = 'doesnotmatter';
    const schema: JSONSchema = {
      required: ['expected']
    };

    localStorageService.setItem(index, value).subscribe(() => {

      localStorageService.getItem(index, { schema }).subscribe((data) => {

        fail();

        done();

      }, (error) => {

        expect(error).toBeTruthy();

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

}

describe('LocalStorage with mock storage', () => {

  let localStorageService = new LocalStorage(new MockLocalDatabase(), new JSONValidator());

  tests(localStorageService);

});

describe('LocalStorage with localStorage', () => {

  let localStorageService = new LocalStorage(new LocalStorageDatabase(), new JSONValidator());

  tests(localStorageService);

});

describe('LocalStorage with IndexedDB', () => {

  let localStorageService = new LocalStorage(new IndexedDBDatabase(), new JSONValidator());

  tests(localStorageService);

});

describe('LocalStorage with localStorage and a prefix', () => {

  let localStorageService = new LocalStorage(new LocalStorageDatabase('myapp'), new JSONValidator());

  tests(localStorageService);

});

describe('LocalStorage with IndexedDB and a prefix', () => {

  let localStorageService = new LocalStorage(new IndexedDBDatabase('myapp'), new JSONValidator());

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
